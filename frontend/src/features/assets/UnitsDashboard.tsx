"use client";

import { useState } from "react";
import type { Flat, GenericRecord } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

export function UnitsDashboard({
  token,
  flats: initialFlats,
  colonies,
  role,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  flats: Flat[];
  colonies: GenericRecord[];
  role?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  // The caretaker is view-only on flats — they see their colony's units but
  // cannot add or edit them.
  const canManageFlats = role !== "care_taker_labour_colony";
  const [flats, setFlats] = useSyncedState(initialFlats);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [filterColony, setFilterColony] = useState("");
  const [form, setForm] = useState({ colony_id: "", flat_no: "", flat_address: "", flat_rooms: "2" });
  const [flatLoc, setFlatLoc] = useState<LatLng | null>(null);

  const colonyName = (id?: number) => colonies.find((c) => c.id === Number(id))?.name || "—";
  const displayed = filterColony ? flats.filter((f) => String(f.colony_id) === filterColony) : flats;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!form.colony_id) {
      toast("Please select a colony.", "error");
      return;
    }
    setSaving(true);
    try {
      const created = await apiRequest<Flat>("/residential-units", token, {
        method: "POST",
        body: JSON.stringify({
          colony_id: Number(form.colony_id),
          flat_no: form.flat_no,
          flat_address: form.flat_address,
          flat_rooms: Number(form.flat_rooms || 0),
          status: "empty",
          latitude: flatLoc?.lat ?? undefined,
          longitude: flatLoc?.lng ?? undefined,
        }),
      });
      setFlats((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, flat_no: "", flat_address: "", flat_rooms: "2" }));
      setFlatLoc(null);
      toast("Flat created successfully.", "success");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Flat create failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen-stack">
      {canManageFlats ? (
      <section className="form-shell">
        <div className="form-header">
          <h2>Add Flat / Unit</h2>
          <p>Colony select karein, flat details bharen, aur exact GPS location map pe mark karein.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Colony <em className="req-mark">*</em></span>
              <select required value={form.colony_id} onChange={(e) => setForm((p) => ({ ...p, colony_id: e.target.value }))}>
                <option value="">— Select colony —</option>
                {colonies.map((c) => <option key={c.id} value={c.id}>{c.name || `Colony #${c.id}`}</option>)}
              </select>
              {!colonies.length ? <small className="field-helper">No colonies yet — create one first.</small> : null}
            </label>
            <label>
              <span>Flat No <em className="req-mark">*</em></span>
              <input required value={form.flat_no} onChange={(e) => setForm((p) => ({ ...p, flat_no: e.target.value }))} placeholder="A-101" />
            </label>
            <label>
              <span>Flat Address <em className="req-mark">*</em></span>
              <input required value={form.flat_address} onChange={(e) => setForm((p) => ({ ...p, flat_address: e.target.value }))} placeholder="Block A, Street 1" />
            </label>
            <label>
              <span>Rooms</span>
              <input type="number" min={1} value={form.flat_rooms} onChange={(e) => setForm((p) => ({ ...p, flat_rooms: e.target.value }))} />
            </label>
          </div>
          <div className="form-map-section">
            <p className="form-map-label">Flat Location (Map)</p>
            <LocationPicker value={flatLoc} onChange={setFlatLoc} hint="Flat ki exact GPS location mark karein — caretaker tasks aur repairs mein accurate rahega." />
          </div>
          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={() => { setForm({ colony_id: "", flat_no: "", flat_address: "", flat_rooms: "2" }); setFlatLoc(null); }}>
              Clear
            </button>
            <button className="primary-button" disabled={saving || !colonies.length}>
              {saving ? "Saving..." : "Create Flat"}
            </button>
          </div>
        </form>
      </section>
      ) : null}

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>{canManageFlats ? "All Flats" : "Colony Flats"}</h2>
            <p>
              {flats.filter((f) => f.status === "empty").length} empty ·{" "}
              {flats.filter((f) => f.status !== "empty").length} occupied / other
            </p>
          </div>
          <div className="card-actions">
            <select value={filterColony} onChange={(e) => setFilterColony(e.target.value)} style={{ minWidth: 160 }}>
              <option value="">All Colonies</option>
              {colonies.map((c) => <option key={c.id} value={c.id}>{c.name || `Colony #${c.id}`}</option>)}
            </select>
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Flat No</th>
              <th>Colony</th>
              <th>Address</th>
              <th>Rooms</th>
              <th>GPS</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!displayed.length ? <tr><td colSpan={6}>No flats found.</td></tr> : null}
            {displayed.map((flat) => (
              <tr key={flat.id}>
                <td className="link-cell">{flat.flat_no}</td>
                <td>{colonyName(flat.colony_id)}</td>
                <td>{flat.flat_address}</td>
                <td>{flat.flat_rooms ?? "—"}</td>
                <td>
                  {flat.latitude
                    ? <span className="soft-tag gps-tag">📍 GPS set</span>
                    : <span className="muted-text">No GPS</span>}
                </td>
                <td><StatusPill status={flat.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
