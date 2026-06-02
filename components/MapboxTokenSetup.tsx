"use client";

import { useState } from "react";
import { getMapboxToken, isValidMapboxToken, saveMapboxToken } from "@/lib/mapbox";

export default function MapboxTokenSetup({
  onTokenSaved,
}: {
  onTokenSaved: (token: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!isValidMapboxToken(trimmed)) {
      setError("Enter a valid public token starting with pk.");
      return;
    }
    saveMapboxToken(trimmed);
    setError(null);
    onTokenSaved(trimmed);
  };

  const existing = getMapboxToken();

  return (
    <div className="flex-1 flex items-center justify-center bg-black p-8">
      <div className="max-w-md w-full border border-paper/20 p-6">
        <p className="font-display text-xl text-paper mb-1">MAP ACCESS — CLASSIFIED</p>
        <p className="font-data text-xs text-muted mb-6">
          Mapbox requires a free public token. No token found in{" "}
          <code className="text-paper/80">.env.local</code>.
        </p>

        <label className="font-data text-[10px] uppercase text-muted block mb-2">
          Public access token (pk.*)
        </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="pk.eyJ1Ijo..."
          className="gov-input mb-2"
          autoComplete="off"
        />
        {error && (
          <p className="font-data text-xs text-red-stamp mb-3">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-paper text-ink font-stat text-lg py-3 hover:bg-paper/90"
        >
          ACTIVATE MAP
        </button>

        <p className="font-data text-[10px] text-muted mt-4 leading-relaxed">
          Get your default token at{" "}
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-stamp hover:underline"
          >
            account.mapbox.com/access-tokens
          </a>
          , then paste it above or add to{" "}
          <code className="text-paper/70">.env.local</code> as{" "}
          <code className="text-paper/70">NEXT_PUBLIC_MAPBOX_TOKEN=pk....</code>{" "}
          and restart <code className="text-paper/70">npm run dev</code>.
        </p>

        {existing && (
          <p className="font-data text-[10px] text-green-forest mt-3">
            Stored token detected but invalid or placeholder.
          </p>
        )}
      </div>
    </div>
  );
}
