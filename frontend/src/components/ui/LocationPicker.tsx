"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as LeafletNS from "leaflet";

export type LatLng = { lat: number; lng: number };

/**
 * Click-to-pick location map (Leaflet + OpenStreetMap, no API key).
 * Click the map or drag the pin to choose where the industry is located;
 * "Use my location" drops the pin on the device's current GPS position.
 */
export function LocationPicker({
  value,
  onChange,
  hint,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
  hint?: string;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markerRef = useRef<LeafletNS.Marker | null>(null);
  const LRef = useRef<typeof LeafletNS | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function placeMarker(lat: number, lng: number) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      return;
    }
    const icon = L.divIcon({ className: "location-pin-wrap", html: '<span class="location-pin"></span>', iconSize: [22, 22], iconAnchor: [11, 22] });
    const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const ll = marker.getLatLng();
      onChangeRef.current({ lat: ll.lat, lng: ll.lng });
    });
    markerRef.current = marker;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = (mod.default ?? mod) as typeof LeafletNS;
      if (cancelled || !mapEl.current || mapRef.current) return;
      LRef.current = L;
      const start = value ?? { lat: 34.0151, lng: 71.5249 }; // Peshawar (KP) default
      const map = L.map(mapEl.current).setView([start.lat, start.lng], value ? 14 : 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      if (value) placeMarker(value.lat, value.lng);
      map.on("click", (e: LeafletNS.LeafletMouseEvent) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      mapRef.current?.setView([lat, lng], 15);
      placeMarker(lat, lng);
      onChangeRef.current({ lat, lng });
    });
  }

  return (
    <div className="location-picker">
      <div ref={mapEl} className="location-map" />
      <div className="location-picker-bar">
        <button type="button" className="ghost-button compact" onClick={useMyLocation}>
          Use my location
        </button>
        <span>{value ? `Selected: ${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}` : (hint || "Map pe click karein ya pin drag karein — location set hogi.")}</span>
      </div>
    </div>
  );
}
