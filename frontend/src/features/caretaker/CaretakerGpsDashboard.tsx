"use client";

import { useState } from "react";
import type { GpsPing, User } from "@/src/types";
import { GpsMap } from "@/src/components/ui/GpsMap";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

/**
 * GPS Tracking — groups caretaker location pings by caretaker, shows each one's
 * last-seen time + coordinates, and plots the selected caretaker's trail on a map.
 * (A caretaker only ever receives their own pings; management sees everyone's.)
 */
export function CaretakerGpsDashboard({
  gps,
  users = [],
  onRefresh,
  isRefreshing,
}: {
  gps: GpsPing[];
  users?: User[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const name = (id: number) => users.find((u) => u.id === id)?.name || `Caretaker #${id}`;
  const fmt = (s?: string) => (s ? s.slice(0, 16).replace("T", " ") : "—");

  const byUser = new Map<number, GpsPing[]>();
  for (const p of gps) {
    const arr = byUser.get(p.user_id) || [];
    arr.push(p);
    byUser.set(p.user_id, arr);
  }
  const rows = [...byUser.entries()]
    .map(([userId, pings]) => {
      const sorted = [...pings].sort((a, b) => String(b.recorded_at || "").localeCompare(String(a.recorded_at || "")));
      return { userId, count: pings.length, latest: sorted[0], pings: sorted };
    })
    .sort((a, b) => String(b.latest?.recorded_at || "").localeCompare(String(a.latest?.recorded_at || "")));

  const selectedRow = selected != null ? rows.find((r) => r.userId === selected) : null;

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Caretakers Tracked" value={rows.length} hint="With GPS pings" />
        <MetricCard title="Total Pings" value={gps.length} hint="Location updates" tone="purple" />
        <MetricCard title="Last Update" value={fmt(rows[0]?.latest?.recorded_at)} hint="Most recent ping" tone="green" />
      </section>

      {selectedRow ? (
        <section className="data-card">
          <div className="card-title">
            <div>
              <h2>{name(selectedRow.userId)} — Location Trail</h2>
              <p>{selectedRow.count} pings · last seen {fmt(selectedRow.latest?.recorded_at)}</p>
            </div>
            <button className="ghost-button" onClick={() => setSelected(null)}>✕ Close</button>
          </div>
          <GpsMap pings={selectedRow.pings} height={360} />
        </section>
      ) : null}

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>GPS Tracking</h2>
            <p>Caretaker locations — &quot;View Trail&quot; se map par track dekhein.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <table>
          <thead>
            <tr><th>Caretaker</th><th>Last Seen</th><th>Location</th><th>Pings</th><th>Action</th></tr>
          </thead>
          <tbody>
            {!rows.length ? <tr><td colSpan={5}>No GPS data yet — caretaker ki duty start hone par pings yahan aayenge.</td></tr> : null}
            {rows.map((r) => (
              <tr key={r.userId} className={selected === r.userId ? "selected-row" : ""}>
                <td><strong>{name(r.userId)}</strong></td>
                <td>{fmt(r.latest?.recorded_at)}</td>
                <td>{r.latest ? `${Number(r.latest.latitude).toFixed(5)}, ${Number(r.latest.longitude).toFixed(5)}` : "—"}</td>
                <td>{r.count}</td>
                <td><button className="ghost-button compact" onClick={() => setSelected(r.userId)}>View Trail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
