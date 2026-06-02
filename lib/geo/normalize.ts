type Position = [number, number];
type Ring = Position[];

/** Signed area in lng/lat space; negative ≈ counter-clockwise (Mapbox exterior). */
function ringSignedArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += (x2 - x1) * (y2 + y1);
  }
  return sum;
}

function closeRing(ring: Ring): Ring {
  if (ring.length < 3) return ring;
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx === lx && fy === ly) return ring;
  return [...ring, ring[0]];
}

/** Exterior rings counter-clockwise; holes clockwise (Mapbox / RFC 7946). */
function orientRing(ring: Ring, exterior: boolean): Ring {
  const closed = closeRing(ring);
  const ccw = ringSignedArea(closed) < 0;
  const wantCcw = exterior;
  if (ccw === wantCcw) return closed;
  return [...closed].reverse();
}

function normalizePolygonCoords(
  coordinates: number[][][]
): number[][][] {
  if (!coordinates.length) return coordinates;
  const [outer, ...holes] = coordinates;
  return [
    orientRing(outer as Ring, true),
    ...holes.map((hole) => orientRing(hole as Ring, false)),
  ];
}

function normalizeGeometry(
  geometry: GeoJSON.Geometry
): GeoJSON.Geometry {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: normalizePolygonCoords(geometry.coordinates),
    };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map(normalizePolygonCoords),
    };
  }
  return geometry;
}

export function normalizeFeatureCollection(
  collection: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: normalizeGeometry(feature.geometry),
    })),
  };
}
