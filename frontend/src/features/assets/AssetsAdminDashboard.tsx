"use client";

import { useState } from "react";
import type { Flat, GenericRecord } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { recordLabel, statusLabel } from "@/src/lib/format";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

const ASSET_CATEGORIES = [
  { value: "street_light", label: "Street Light" },
  { value: "transformer", label: "Transformer" },
  { value: "tube_well", label: "Tube Well" },
  { value: "generator", label: "Generator" },
  { value: "water_tank", label: "Water Tank" },
  { value: "other", label: "Other" },
];

function coordLabel(rec: GenericRecord): string {
  if (rec.latitude && rec.longitude) return `${Number(rec.latitude).toFixed(5)}, ${Number(rec.longitude).toFixed(5)}`;
  return rec.address || "—";
}

export function AssetsAdminDashboard({
  token,
  colonies: initialColonies,
  flats: initialFlats,
  assets: initialAssets,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  colonies: GenericRecord[];
  flats: Flat[];
  assets: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [colonies, setColonies] = useSyncedState(initialColonies);
  const [flats, setFlats] = useSyncedState(initialFlats);
  const [assets, setAssets] = useSyncedState(initialAssets);
  const [selectedColonyId, setSelectedColonyId] = useState("");
  const toast = useToast();
  const [saving, setSaving] = useState<"colony" | "flat" | "asset" | null>(null);

  const [colonyForm, setColonyForm] = useState({ name: "", address: "" });
  const [colonyLoc, setColonyLoc] = useState<LatLng | null>(null);

  const [flatForm, setFlatForm] = useState({ colony_id: "", flat_no: "", flat_address: "", flat_rooms: "2" });
  const [flatLoc, setFlatLoc] = useState<LatLng | null>(null);

  const [assetForm, setAssetForm] = useState({ colony_id: "", category: "street_light", name: "", address: "" });
  const [assetLoc, setAssetLoc] = useState<LatLng | null>(null);

  const selectedColony = selectedColonyId ? Number(selectedColonyId) : undefined;
  const filteredFlats = selectedColony ? flats.filter((flat) => Number(flat.colony_id) === selectedColony) : flats;
  const filteredAssets = selectedColony ? assets.filter((asset) => Number(asset.colony_id) === selectedColony) : assets;
  const colonyName = (id?: number) => colonies.find((colony) => colony.id === Number(id))?.name || "Unassigned";
  const categoryLabel = (value?: string) => ASSET_CATEGORIES.find((item) => item.value === value)?.label || statusLabel(value || "other");
  const countCategory = (category: string) => assets.filter((asset) => asset.category === category).length;

  async function submitColony(event: { preventDefault(): void }) {
    event.preventDefault();
    setSaving("colony");
    try {
      const created = await apiRequest<GenericRecord>("/colonies", token, {
        method: "POST",
        body: JSON.stringify({
          ...colonyForm,
          latitude: colonyLoc?.lat ?? undefined,
          longitude: colonyLoc?.lng ?? undefined,
        }),
      });
      setColonies((prev) => [created, ...prev]);
      setColonyForm({ name: "", address: "" });
      setColonyLoc(null);
      toast("Colony created successfully.", "success");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Colony create failed.", "error");
    } finally {
      setSaving(null);
    }
  }

  async function submitFlat(event: { preventDefault(): void }) {
    event.preventDefault();
    setSaving("flat");
    try {
      const created = await apiRequest<Flat>("/residential-units", token, {
        method: "POST",
        body: JSON.stringify({
          colony_id: Number(flatForm.colony_id),
          flat_no: flatForm.flat_no,
          flat_address: flatForm.flat_address,
          flat_rooms: Number(flatForm.flat_rooms || 0),
          status: "empty",
          latitude: flatLoc?.lat ?? undefined,
          longitude: flatLoc?.lng ?? undefined,
        }),
      });
      setFlats((prev) => [created, ...prev]);
      setFlatForm((prev) => ({ ...prev, flat_no: "", flat_address: "", flat_rooms: "2" }));
      setFlatLoc(null);
      toast("Flat created successfully.", "success");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Flat create failed.", "error");
    } finally {
      setSaving(null);
    }
  }

  async function submitAsset(event: { preventDefault(): void }) {
    event.preventDefault();
    setSaving("asset");
    try {
      const created = await apiRequest<GenericRecord>("/assets", token, {
        method: "POST",
        body: JSON.stringify({
          colony_id: assetForm.colony_id ? Number(assetForm.colony_id) : undefined,
          category: assetForm.category,
          name: assetForm.name,
          address: assetForm.address || undefined,
          latitude: assetLoc?.lat ?? undefined,
          longitude: assetLoc?.lng ?? undefined,
        }),
      });
      setAssets((prev) => [created, ...prev]);
      setAssetForm((prev) => ({ ...prev, name: "", address: "" }));
      setAssetLoc(null);
      apiRequest(`/assets/${created.id}/status`, token, { method: "POST", body: JSON.stringify({ status: "ok" }) }).catch(() => {});
      toast("Asset added successfully.", "success");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Asset create failed.", "error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Colonies" value={colonies.length} hint="Managed colony locations" />
        <MetricCard title="Flats" value={flats.length} hint={`${flats.filter((flat) => flat.status === "empty").length} empty units`} tone="green" />
        <MetricCard title="Street Lights" value={countCategory("street_light")} hint="Lighting assets" tone="amber" />
        <MetricCard title="Transformers" value={countCategory("transformer")} hint={`${countCategory("tube_well")} tube wells`} tone="purple" />
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Assets Admin Dashboard</h2>
            <p>Create colonies, enter flats, and maintain colony assets from one place. Har cheez ka GPS location bhi set karein.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <div className="filter-bar">
          <select value={selectedColonyId} onChange={(event) => setSelectedColonyId(event.target.value)}>
            <option value="">All colonies</option>
            {colonies.map((colony) => (
              <option key={colony.id} value={colony.id}>{colony.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => setSelectedColonyId("")}>Reset</button>
        </div>
      </section>

      <section className="asset-admin-grid">
        {/* ── Colony form ────────────────────────────────── */}
        <form className="form-shell asset-admin-form" onSubmit={submitColony}>
          <div className="form-header">
            <h2>Add Colony</h2>
            <p>Colony ka naam, address, aur map location set karein.</p>
          </div>
          <div className="form-grid single">
            <label>
              <span>Colony Name</span>
              <input required value={colonyForm.name} onChange={(e) => setColonyForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Labour Colony A" />
            </label>
            <label>
              <span>Address</span>
              <textarea required value={colonyForm.address} onChange={(e) => setColonyForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Colony address" />
            </label>
          </div>
          <div className="form-map-section">
            <p className="form-map-label">Colony Location (Map)</p>
            <LocationPicker value={colonyLoc} onChange={setColonyLoc} hint="Colony ki exact location map pe mark karein." />
          </div>
          <div className="form-actions">
            <button className="primary-button" disabled={saving === "colony"}>
              {saving === "colony" ? "Saving..." : "Create Colony"}
            </button>
          </div>
        </form>

        {/* ── Flat form ──────────────────────────────────── */}
        <form className="form-shell asset-admin-form" onSubmit={submitFlat}>
          <div className="form-header">
            <h2>Add Flat</h2>
            <p>Flat ki colony, details, aur exact GPS location set karein.</p>
          </div>
          <div className="form-grid single">
            <label>
              <span>Colony</span>
              <select required value={flatForm.colony_id} onChange={(e) => setFlatForm((prev) => ({ ...prev, colony_id: e.target.value }))}>
                <option value="">Select colony</option>
                {colonies.map((colony) => <option key={colony.id} value={colony.id}>{colony.name}</option>)}
              </select>
            </label>
            <label>
              <span>Flat No</span>
              <input required value={flatForm.flat_no} onChange={(e) => setFlatForm((prev) => ({ ...prev, flat_no: e.target.value }))} placeholder="A-101" />
            </label>
            <label>
              <span>Flat Address</span>
              <input required value={flatForm.flat_address} onChange={(e) => setFlatForm((prev) => ({ ...prev, flat_address: e.target.value }))} placeholder="Block A, Street 1" />
            </label>
            <label>
              <span>Rooms</span>
              <input required min={1} type="number" value={flatForm.flat_rooms} onChange={(e) => setFlatForm((prev) => ({ ...prev, flat_rooms: e.target.value }))} />
            </label>
          </div>
          <div className="form-map-section">
            <p className="form-map-label">Flat Location (Map)</p>
            <LocationPicker value={flatLoc} onChange={setFlatLoc} hint="Flat ki exact GPS location mark karein — caretaker tasks mein kaam ayega." />
          </div>
          <div className="form-actions">
            <button className="primary-button" disabled={saving === "flat" || !colonies.length}>
              {saving === "flat" ? "Saving..." : "Create Flat"}
            </button>
          </div>
        </form>

        {/* ── Asset form ─────────────────────────────────── */}
        <form className="form-shell asset-admin-form" onSubmit={submitAsset}>
          <div className="form-header">
            <h2>Add Asset</h2>
            <p>Street light, transformer, tube well — sab ki GPS location save karein.</p>
          </div>
          <div className="form-grid single">
            <label>
              <span>Colony</span>
              <select required value={assetForm.colony_id} onChange={(e) => setAssetForm((prev) => ({ ...prev, colony_id: e.target.value }))}>
                <option value="">Select colony</option>
                {colonies.map((colony) => <option key={colony.id} value={colony.id}>{colony.name}</option>)}
              </select>
            </label>
            <label>
              <span>Asset Type</span>
              <select value={assetForm.category} onChange={(e) => setAssetForm((prev) => ({ ...prev, category: e.target.value }))}>
                {ASSET_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </label>
            <label>
              <span>Asset Name / No</span>
              <input required value={assetForm.name} onChange={(e) => setAssetForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Street Light SL-01" />
            </label>
            <label>
              <span>Address / Notes</span>
              <input value={assetForm.address} onChange={(e) => setAssetForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Near Block B gate" />
            </label>
          </div>
          <div className="form-map-section">
            <p className="form-map-label">Asset Location (Map)</p>
            <LocationPicker value={assetLoc} onChange={setAssetLoc} hint="Asset ki exact location — repair tasks assign karne mein accurate rahega." />
          </div>
          <div className="form-actions">
            <button className="primary-button" disabled={saving === "asset" || !colonies.length}>
              {saving === "asset" ? "Saving..." : "Add Asset"}
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-grid wide">
        <div className="data-card">
          <div className="card-title">
            <div>
              <h2>Flats</h2>
              <p>{selectedColonyId ? "Filtered by selected colony" : "All colony flats"}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Flat No</th>
                <th>Colony</th>
                <th>Rooms</th>
                <th>GPS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlats.length ? (
                filteredFlats.map((flat) => (
                  <tr key={flat.id}>
                    <td className="link-cell">{flat.flat_no}</td>
                    <td>{colonyName(flat.colony_id)}</td>
                    <td>{flat.flat_rooms || "—"}</td>
                    <td>{flat.latitude ? <span className="soft-tag gps-tag">📍 GPS set</span> : <span className="muted-text">No GPS</span>}</td>
                    <td><StatusPill status={flat.status} /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5}>No flats found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="data-card">
          <div className="card-title">
            <div>
              <h2>Assets Register</h2>
              <p>{filteredAssets.length} assets in current view</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Colony</th>
                <th>GPS / Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="link-cell">{recordLabel(asset, `Asset ${asset.id}`)}</td>
                    <td><span className="soft-tag">{categoryLabel(asset.category)}</span></td>
                    <td>{colonyName(asset.colony_id)}</td>
                    <td>
                      {asset.latitude ? <span className="soft-tag gps-tag">📍 {coordLabel(asset)}</span> : <span className="muted-text">{asset.address || "—"}</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4}>No assets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
