"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import type { Incident } from "@/lib/types";
import {
  INDIA_BOUNDS,
  INDIA_CENTER,
  MAP_STYLE,
  FREE_MAP_STYLE,
  getCategoryColor,
  getMapboxToken,
} from "@/lib/mapbox";
import { getMarkerSize } from "@/lib/constants";
import { normalizeFeatureCollection } from "@/lib/geo/normalize";

type MapModule = typeof import("react-map-gl/maplibre");
type MapRef = import("react-map-gl/maplibre").MapRef;

interface MapProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelectIncident: (incident: Incident | null) => void;
  newIncidentIds?: Set<string>;
}

export default function MapView({
  incidents,
  selectedId,
  onSelectIncident,
  newIncidentIds = new Set(),
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapMod, setMapMod] = useState<MapModule | null>(null);
  const [useMapbox, setUseMapbox] = useState(false);
  const [mapboxToken, setMapboxToken] = useState("");
  const [viewState, setViewState] = useState({
    ...INDIA_CENTER,
    bearing: 0,
    pitch: 0,
  });
  const [statesGeo, setStatesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [forestGeo, setForestGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      setLoadError(null);
      try {
        const token = getMapboxToken();
        const hasMapbox = Boolean(token);

        if (hasMapbox) {
          await import("mapbox-gl/dist/mapbox-gl.css");
          const mod = await import("react-map-gl/mapbox");
          if (!cancelled) {
            setMapMod(mod as unknown as MapModule);
            setUseMapbox(true);
            setMapboxToken(token);
          }
        } else {
          await import("maplibre-gl/dist/maplibre-gl.css");
          const mod = await import("react-map-gl/maplibre");
          if (!cancelled) {
            setMapMod(mod);
            setUseMapbox(false);
          }
        }
      } catch (err) {
        console.error("Map library failed to load:", err);
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Map failed to load"
          );
          setMapMod(null);
        }
      }
    }

    loadMap();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  useEffect(() => {
    fetch("/geo/india-states.json")
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) =>
        setStatesGeo(normalizeFeatureCollection(data))
      )
      .catch(() => {});
    fetch("/geo/india-forest-cover.json")
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) =>
        setForestGeo(normalizeFeatureCollection(data))
      )
      .catch(() => {});
  }, []);

  const points = useMemo(
    () =>
      incidents.map((i) => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          incidentId: i.id,
          tree_count: i.tree_count ?? 1,
          category: i.reason_category,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [i.lng, i.lat],
        },
      })),
    [incidents]
  );

  const index = useMemo(() => {
    const sc = new Supercluster({ radius: 60, maxZoom: 8 });
    sc.load(points);
    return sc;
  }, [points]);

  const clusters = useMemo(() => {
    const bounds = mapRef.current?.getMap()?.getBounds();
    if (!bounds) return [];
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const zoom = Math.floor(viewState.zoom);
    if (zoom >= 8) return [];
    return index.getClusters(bbox, zoom);
  }, [index, viewState.zoom]);

  const showClusters = viewState.zoom < 8;

  const resetView = useCallback(() => {
    mapRef.current?.fitBounds(
      [
        [INDIA_BOUNDS[0], INDIA_BOUNDS[1]],
        [INDIA_BOUNDS[2], INDIA_BOUNDS[3]],
      ],
      { padding: 40, duration: 1000 }
    );
  }, []);

  /** Log-scaled weights so sparse country-wide data still produces visible heat blobs */
  const heatmapGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const weights = incidents.map((i) => {
      const trees = i.tree_count ?? 50;
      return Math.max(0.35, Math.log10(trees + 1) / Math.log10(60000));
    });
    const maxW = Math.max(...weights, 0.35);

    return {
      type: "FeatureCollection",
      features: incidents.map((i, idx) => ({
        type: "Feature",
        properties: { weight: weights[idx] / maxW },
        geometry: {
          type: "Point",
          coordinates: [i.lng, i.lat],
        },
      })),
    };
  }, [incidents]);

  if (!mapMod) {
    return (
      <div className="absolute inset-0 bg-[#0d0d0b] flex flex-col items-center justify-center gap-3 p-4 text-center">
        {loadError ? (
          <>
            <p className="font-data text-xs text-red-stamp">MAP FAILED TO LOAD</p>
            <p className="font-data text-2xs text-muted max-w-xs">{loadError}</p>
            <button
              type="button"
              onClick={() => setLoadAttempt((n) => n + 1)}
              className="gov-btn"
            >
              RETRY
            </button>
          </>
        ) : (
          <p className="font-data text-[10px] text-muted animate-pulse">
            INITIALIZING TERRAIN MAP...
          </p>
        )}
      </div>
    );
  }

  const MapGL = mapMod.default;
  const { Layer, Marker, NavigationControl, Source } = mapMod;

  const mapProps = useMapbox
    ? { mapboxAccessToken: mapboxToken, mapStyle: MAP_STYLE }
    : { mapStyle: FREE_MAP_STYLE };

  const markerLayer = showClusters
    ? clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates;
        const isCluster = cluster.properties.cluster;
        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={lng}
              latitude={lat}
              anchor="center"
              onClick={() => {
                const expansionZoom = index.getClusterExpansionZoom(
                  cluster.id as number
                );
                mapRef.current?.flyTo({
                  center: [lng, lat],
                  zoom: expansionZoom,
                });
              }}
            >
              <div className="w-10 h-10 rounded-full bg-black border border-paper/40 flex items-center justify-center cursor-pointer">
                <span className="font-data text-xs text-paper">
                  {cluster.properties.point_count as number}
                </span>
              </div>
            </Marker>
          );
        }
        const incident = incidents.find(
          (i) => i.id === cluster.properties.incidentId
        );
        if (!incident) return null;
        return (
          <IncidentMarker
            key={incident.id}
            Marker={Marker}
            incident={incident}
            selected={selectedId === incident.id}
            isNew={newIncidentIds.has(incident.id)}
            onClick={() => onSelectIncident(incident)}
          />
        );
      })
    : incidents.map((incident) => (
        <IncidentMarker
          key={incident.id}
          Marker={Marker}
          incident={incident}
          selected={selectedId === incident.id}
          isNew={newIncidentIds.has(incident.id)}
          onClick={() => onSelectIncident(incident)}
        />
      ));

  return (
    <div className="absolute inset-0 min-h-[200px]">
      <MapGL
        ref={mapRef}
        {...viewState}
        {...mapProps}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        maxBounds={[
          [INDIA_BOUNDS[0] - 5, INDIA_BOUNDS[1] - 5],
          [INDIA_BOUNDS[2] + 5, INDIA_BOUNDS[3] + 5],
        ]}
        onLoad={resetView}
        onClick={() => onSelectIncident(null)}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {incidents.length > 0 && (
          <Source
            id="heatmap-source"
            type="geojson"
            data={heatmapGeoJSON}
            tolerance={0.4}
          >
            <Layer
              id="heatmap-layer"
              type="heatmap"
              paint={{
                "heatmap-weight": ["get", "weight"],
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  1.8,
                  4,
                  1.4,
                  8,
                  0.9,
                  12,
                  0.5,
                ],
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  50,
                  3,
                  70,
                  6,
                  45,
                  10,
                  28,
                  14,
                  18,
                ],
                "heatmap-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  0.85,
                  10,
                  0.7,
                  14,
                  0.35,
                ],
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(10,10,8,0)",
                  0.05,
                  "rgba(46,204,113,0.25)",
                  0.25,
                  "rgba(241,196,15,0.55)",
                  0.5,
                  "rgba(230,126,34,0.75)",
                  0.75,
                  "rgba(192,57,43,0.9)",
                  1,
                  "rgba(192,57,43,1)",
                ],
              }}
            />
          </Source>
        )}

        {forestGeo && (
          <Source id="forest" type="geojson" data={forestGeo}>
            <Layer
              id="forest-fill"
              type="fill"
              paint={{
                "fill-color": "#2ecc71",
                "fill-opacity": 0.12,
                "fill-antialias": true,
              }}
            />
            <Layer
              id="forest-outline"
              type="line"
              paint={{
                "line-color": "#2ecc71",
                "line-opacity": 0.5,
                "line-width": 1.5,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
        )}

        {statesGeo && (
          <Source id="states" type="geojson" data={statesGeo}>
            <Layer
              id="states-outline"
              type="line"
              paint={{
                "line-color": "#f0ead6",
                "line-opacity": 0.2,
                "line-width": 1,
              }}
            />
          </Source>
        )}

        {markerLayer}
      </MapGL>

      <div className="absolute z-10 bottom-16 right-3 sm:bottom-auto sm:top-4 sm:right-4">
        <button
          type="button"
          onClick={resetView}
          className="gov-btn !text-2xs sm:!text-[10px] !min-h-0 py-2 px-2.5 sm:px-3 bg-black/90 backdrop-blur-sm"
        >
          RESET VIEW
        </button>
      </div>
    </div>
  );
}

function IncidentMarker({
  Marker,
  incident,
  selected,
  isNew,
  onClick,
}: {
  Marker: MapModule["Marker"];
  incident: Incident;
  selected: boolean;
  isNew: boolean;
  onClick: () => void;
}) {
  const color = getCategoryColor(incident.reason_category);
  const size = getMarkerSize(incident.tree_count);
  const isIllegal = incident.reason_category === "illegal";

  return (
    <Marker
      longitude={incident.lng}
      latitude={incident.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div
        className={`cursor-pointer flex items-center justify-center rounded-full ${
          isIllegal ? "marker-illegal" : ""
        } ${isNew ? "marker-new" : ""}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          border: selected ? "2px solid #f0ead6" : "2px solid rgba(0,0,0,0.5)",
          boxShadow: selected ? "0 0 0 3px rgba(240,234,214,0.5)" : undefined,
        }}
        title={incident.location_name}
      >
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 12 12">
          <path
            d="M6 1 L9 7 L7 7 L8 11 L4 11 L5 7 L3 7 Z"
            fill="#0a0a08"
            opacity="0.8"
          />
          <line x1="2" y1="6" x2="10" y2="6" stroke="#0a0a08" strokeWidth="1" />
        </svg>
      </div>
    </Marker>
  );
}
