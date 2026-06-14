"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as LeafletNS from "leaflet";
import type { GpsPing } from "@/src/types";

type LatLng = [number, number];

function toPoints(pings: GpsPing[]): LatLng[] {
  return pings
    .map((p) => [Number(p.latitude), Number(p.longitude)] as LatLng)
    .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0));
}

function drawLayers(
  L: typeof LeafletNS,
  map: LeafletNS.Map,
  points: LatLng[],
  live: LatLng | null,
  layersRef: { current: LeafletNS.Layer[] },
) {
  layersRef.current.forEach((l) => map.removeLayer(l));
  layersRef.current = [];

  if (points.length > 1) {
    const line = L.polyline(points, { color: "#3b82f6", weight: 3, opacity: 0.8 }).addTo(map);
    layersRef.current.push(line);
  }

  if (points.length > 0) {
    const dot = L.circleMarker(points[0], {
      radius: 7,
      fillColor: "#16a34a",
      color: "#fff",
      weight: 2,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup("Duty yahan se shuru hui");
    layersRef.current.push(dot);
  }

  const cur = live ?? (points.length ? points[points.length - 1] : null);
  if (cur) {
    // circleMarker (not L.marker) so there is no dependency on Leaflet's default
    // icon image, which fails to load under bundlers and would show a broken pin.
    const m = L.circleMarker(cur, {
      radius: 9,
      fillColor: "#ef4444",
      color: "#fff",
      weight: 3,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup("<b>Is waqt yahan hain</b>")
      .openPopup();
    layersRef.current.push(m);
    map.setView(cur, Math.max(map.getZoom(), 15));
  }
}

export function GpsMap({
  pings,
  currentPos,
  height = 400,
}: {
  pings: GpsPing[];
  currentPos?: LatLng | null;
  height?: number;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const LRef = useRef<typeof LeafletNS | null>(null);
  const layersRef = useRef<LeafletNS.Layer[]>([]);
  const pingsRef = useRef(pings);
  pingsRef.current = pings;
  const posRef = useRef(currentPos ?? null);
  posRef.current = currentPos ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = (mod.default ?? mod) as typeof LeafletNS;
      if (cancelled || !mapEl.current || mapRef.current) return;
      LRef.current = L;

      const pts = toPoints(pingsRef.current);
      const cur = posRef.current ?? (pts.length ? pts[pts.length - 1] : null);
      const center: LatLng = cur ?? [34.0151, 71.5249]; // Peshawar default

      const map = L.map(mapEl.current).setView(center, cur ? 15 : 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      drawLayers(L, map, pts, posRef.current, layersRef);
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      LRef.current = null;
      layersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (LRef.current && mapRef.current) {
      drawLayers(LRef.current, mapRef.current, toPoints(pings), currentPos ?? null, layersRef);
    }
  }, [pings, currentPos]);

  const hasData = pings.length > 0 || currentPos;

  // The map container is always mounted so Leaflet initialises on mount (even
  // before any GPS data). The empty-state is an overlay, not a replacement —
  // otherwise the map div would not exist when the first location arrives and
  // the one-time init effect would never run, leaving the map blank.
  return (
    <div style={{ position: "relative", height, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <div ref={mapEl} style={{ position: "absolute", inset: 0 }} />
      {!hasData ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(248,250,252,0.88)",
            color: "#94a3b8",
            fontSize: "0.875rem",
            pointerEvents: "none",
            zIndex: 500,
          }}
        >
          Duty start hone ke baad GPS trail yahan dikhega.
        </div>
      ) : null}
    </div>
  );
}
