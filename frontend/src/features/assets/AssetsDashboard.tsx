"use client";

import { useMemo, useState } from "react";
import type { GenericRecord } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { statusLabel as _unused } from "@/src/lib/format"; // kept for future use
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

const ASSET_CATEGORIES = [
  { value: "street_light",  label: "Street Light" },
  { value: "transformer",   label: "Transformer" },
  { value: "tube_well",     label: "Tube Well" },
  { value: "generator",     label: "Generator" },
  { value: "water_tank",    label: "Water Tank" },
  { value: "sewerage_pump", label: "Sewerage Pump" },
  { value: "road",          label: "Road / Pathway" },
  { value: "boundary_wall", label: "Boundary Wall" },
  { value: "other",         label: "Other" },
];

const ASSET_STATUSES = [
  { value: "ok",           label: "OK",           tone: "green"  },
  { value: "under_repair", label: "Under Repair",  tone: "amber"  },
  { value: "broken",       label: "Broken",        tone: "red"    },
  { value: "inactive",     label: "Inactive",      tone: "gray"   },
] as const;

const CUSTOM_TYPES_KEY = "wwb_asset_custom_types";

function loadCustomTypes(): string[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_TYPES_KEY) || "[]"); } catch { return []; }
}
function saveCustomTypes(types: string[]) {
  try { localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(types)); } catch { /* ignore */ }
}

function categoryLabel(value?: string) {
  if (!value) return "Other";
  const preset = ASSET_CATEGORIES.find((c) => c.value === value);
  if (preset) return preset.label;
  // custom type: title-case the raw value
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function coordLabel(lat?: string | number | null, lng?: string | number | null) {
  if (!lat || !lng) return null;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

export function AssetsDashboard({
  token,
  assets: initialAssets,
  colonies,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  assets: GenericRecord[];
  colonies: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [assets, setAssets] = useSyncedState(initialAssets);
  const toast = useToast();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    colony_id: "",
    category: "street_light",
    name: "",
    address: "",
  });
  const [loc, setLoc] = useState<LatLng | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // ── Custom type management ───────────────────────────────────────────────────
  const [customTypes, setCustomTypes] = useState<string[]>(loadCustomTypes);
  const [addingType, setAddingType]   = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // All unique categories: presets + custom + any found in existing assets
  const allCategories = useMemo(() => {
    const presetValues = new Set(ASSET_CATEGORIES.map((c) => c.value));
    const fromAssets = assets
      .map((a) => a.category)
      .filter((c): c is string => !!c && !presetValues.has(c));
    const extra = Array.from(new Set([...customTypes, ...fromAssets]));
    return { presets: ASSET_CATEGORIES, extra };
  }, [assets, customTypes]);

  function confirmAddType() {
    const slug = newTypeName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!slug) return;
    const already = ASSET_CATEGORIES.some((c) => c.value === slug) || customTypes.includes(slug);
    if (!already) {
      const next = [...customTypes, slug];
      setCustomTypes(next);
      saveCustomTypes(next);
    }
    setForm((p) => ({ ...p, category: slug }));
    setNewTypeName("");
    setAddingType(false);
  }

  // ── Working / Not-working view ──────────────────────────────────────────────
  const [assetView, setAssetView] = useState<"all" | "working" | "not_working">("all");

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterColony, setFilterColony]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus]     = useState("");
  const [search, setSearch]                 = useState("");

  // ── Status update ───────────────────────────────────────────────────────────
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const colonyName = (id?: number) =>
    colonies.find((c) => c.id === Number(id))?.name || "—";

  // ── Filtered list ───────────────────────────────────────────────────────────
  const displayed = assets.filter((a) => {
    if (assetView === "working"    && a.status !== "ok" && a.status !== "inactive" && a.status) return false;
    if (assetView === "not_working" && a.status !== "broken" && a.status !== "under_repair")     return false;
    if (filterColony   && String(a.colony_id) !== filterColony)   return false;
    if (filterCategory && a.category !== filterCategory)           return false;
    if (filterStatus   && a.status !== filterStatus)               return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(a.name || "").toLowerCase().includes(q) &&
          !(a.address || "").toLowerCase().includes(q) &&
          !categoryLabel(a.category).toLowerCase().includes(q))   return false;
    }
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const byCategory  = (cat: string) => assets.filter((a) => a.category === cat).length;
  const broken      = assets.filter((a) => a.status === "broken").length;
  const repair      = assets.filter((a) => a.status === "under_repair").length;
  const notWorking  = broken + repair;
  const working     = assets.filter((a) => !a.status || a.status === "ok" || a.status === "inactive").length;
  const withGps     = assets.filter((a) => a.latitude && a.longitude).length;

  // ── Submit new asset ────────────────────────────────────────────────────────
  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!form.colony_id) { toast("Colony select karein.", "error"); return; }
    if (!form.name.trim()) { toast("Asset name required.", "error"); return; }
    setSaving(true);
    try {
      const created = await apiRequest<GenericRecord>("/assets", token, {
        method: "POST",
        body: JSON.stringify({
          colony_id: Number(form.colony_id),
          category:  form.category,
          name:      form.name.trim(),
          address:   form.address.trim() || undefined,
          latitude:  loc?.lat ?? undefined,
          longitude: loc?.lng ?? undefined,
        }),
      });
      // set initial status to 'ok'
      apiRequest(`/assets/${created.id}/status`, token, {
        method: "POST",
        body: JSON.stringify({ status: "ok" }),
      }).catch(() => {});

      setAssets((prev) => [{ ...created, status: "ok" }, ...prev]);
      setForm((p) => ({ ...p, name: "", address: "" }));
      setLoc(null);
      toast(`Asset "${created.name}" added — ab task dropdown mein milega.`, "success");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Asset add failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Quick status update ─────────────────────────────────────────────────────
  async function changeStatus(assetId: number, status: string) {
    setUpdatingId(assetId);
    try {
      await apiRequest(`/assets/${assetId}/status`, token, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, status } : a))
      );
      toast("Status updated.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Status update failed.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="screen-stack">
      {/* ── Summary metrics ──────────────────────────────────────────────────── */}
      <section className="metric-grid">
        <MetricCard title="Total Assets" value={assets.length} hint={`${withGps} with GPS location`} />
        <MetricCard title="Working" value={working} hint="OK / inactive — operational" tone="green" />
        <MetricCard title="Not Working" value={notWorking} hint={`${broken} broken · ${repair} under repair`} tone="red" />
        <MetricCard title="Street Lights" value={byCategory("street_light")} hint={`${byCategory("transformer")} transformers · ${byCategory("tube_well")} tube wells`} tone="amber" />
      </section>

      {/* ── Add asset form ────────────────────────────────────────────────────── */}
      <section className="form-shell">
        <div className="form-header">
          <h2>New Asset Add Karein</h2>
          <p>
            Colony, type, naam, aur map location set karein.
            Asset save hone ke baad <strong>task dropdown</strong> mein automatically aayega.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Colony <em className="req-mark">*</em></span>
              <select required value={form.colony_id} onChange={set("colony_id")}>
                <option value="">— Colony select karein —</option>
                {colonies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name || `Colony #${c.id}`}</option>
                ))}
              </select>
              {!colonies.length && (
                <small className="field-helper">Pehle koi colony banayein.</small>
              )}
            </label>

            <div className="type-field-group">
              <label style={{ flex: 1 }}>
                <span>Asset Type <em className="req-mark">*</em></span>
                <select
                  value={addingType ? "__new__" : form.category}
                  onChange={(e) => {
                    if (e.target.value === "__new__") { setAddingType(true); setNewTypeName(""); }
                    else { setAddingType(false); setForm((p) => ({ ...p, category: e.target.value })); }
                  }}
                >
                  {/* Preset types */}
                  <optgroup label="Standard Types">
                    {allCategories.presets.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </optgroup>
                  {/* Custom / extra types from DB or user */}
                  {allCategories.extra.length > 0 && (
                    <optgroup label="Custom Types">
                      {allCategories.extra.map((slug) => (
                        <option key={slug} value={slug}>{categoryLabel(slug)}</option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__new__">➕ Naya type add karein...</option>
                </select>
              </label>

              {addingType && (
                <div className="add-type-inline">
                  <input
                    autoFocus
                    placeholder="Type naam likhein, e.g. Playground"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmAddType(); } if (e.key === "Escape") setAddingType(false); }}
                  />
                  <button type="button" className="primary-button compact" onClick={confirmAddType} disabled={!newTypeName.trim()}>
                    Add
                  </button>
                  <button type="button" className="ghost-button compact" onClick={() => { setAddingType(false); setNewTypeName(""); }}>
                    ✕
                  </button>
                </div>
              )}
            </div>

            <label>
              <span>Asset Name / Number <em className="req-mark">*</em></span>
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Street Light SL-01, Transformer T-05"
              />
            </label>

            <label>
              <span>Address / Notes</span>
              <input
                value={form.address}
                onChange={set("address")}
                placeholder="e.g. Near Block B main gate"
              />
            </label>
          </div>

          {/* Map picker */}
          <div className="form-map-section">
            <p className="form-map-label">
              Asset Location (Map)
              {loc
                ? <span className="gps-coords-hint"> — {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</span>
                : <span className="muted-text"> — Map pe click karein ya "Use my location" dabayein</span>}
            </p>
            <LocationPicker
              value={loc}
              onChange={setLoc}
              hint="Asset ki exact GPS location — repair task assign karne mein kaam aayega."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => { setForm({ colony_id: "", category: "street_light", name: "", address: "" }); setLoc(null); }}
            >
              Clear
            </button>
            <button className="primary-button" disabled={saving || !colonies.length}>
              {saving ? "Adding..." : "Asset Add Karein"}
            </button>
          </div>
        </form>
      </section>

      {/* ── Filter bar ───────────────────────────────────────────────────────── */}
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Assets Register ({displayed.length} / {assets.length})</h2>
            <p>Yahan se asset ka status bhi update kar saktay hain — broken mark karein to task create ho sake.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>

        {/* Working / Not Working tab strip */}
        <div className="asset-view-tabs">
          <button
            type="button"
            className={assetView === "all" ? "tab-btn active" : "tab-btn"}
            onClick={() => setAssetView("all")}
          >
            All ({assets.length})
          </button>
          <button
            type="button"
            className={assetView === "working" ? "tab-btn active tab-green" : "tab-btn tab-green"}
            onClick={() => setAssetView("working")}
          >
            ✅ Working ({working})
          </button>
          <button
            type="button"
            className={assetView === "not_working" ? "tab-btn active tab-red" : "tab-btn tab-red"}
            onClick={() => setAssetView("not_working")}
          >
            ⚠ Not Working ({notWorking})
          </button>
        </div>

        <div className="filter-bar" style={{ flexWrap: "wrap", gap: 8 }}>
          <input
            className="search-input"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <select value={filterColony} onChange={(e) => setFilterColony(e.target.value)}>
            <option value="">All Colonies</option>
            {colonies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Types</option>
            {allCategories.presets.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
            {allCategories.extra.map((slug) => (
              <option key={slug} value={slug}>{categoryLabel(slug)}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {(filterColony || filterCategory || filterStatus || search) && (
            <button className="ghost-button compact" onClick={() => { setFilterColony(""); setFilterCategory(""); setFilterStatus(""); setSearch(""); }}>
              ✕ Clear filters
            </button>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th>Colony</th>
              <th>GPS</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length ? displayed.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <strong>{asset.name || `Asset #${asset.id}`}</strong>
                  {asset.address && <><br /><span className="muted-text">{asset.address}</span></>}
                </td>
                <td>
                  <span className="soft-tag">{categoryLabel(asset.category)}</span>
                </td>
                <td>{colonyName(asset.colony_id)}</td>
                <td>
                  {coordLabel(asset.latitude, asset.longitude)
                    ? <span className="soft-tag gps-tag">📍 {coordLabel(asset.latitude, asset.longitude)}</span>
                    : <span className="muted-text">No GPS</span>}
                </td>
                <td>
                  <StatusPill status={asset.status || "ok"} />
                </td>
                <td>
                  <select
                    value={asset.status || "ok"}
                    disabled={updatingId === asset.id}
                    onChange={(e) => changeStatus(asset.id, e.target.value)}
                    style={{ fontSize: 13, padding: "4px 8px", borderRadius: 6 }}
                  >
                    {ASSET_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6}>
                  {search || filterColony || filterCategory || filterStatus
                    ? "Filter se koi asset nahi mila — filter clear karein."
                    : "Koi asset nahi — upar form se pehla asset add karein."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ── Category breakdown ────────────────────────────────────────────────── */}
      {assets.length > 0 && (
        <section className="data-card">
          <div className="card-title">
            <div><h2>Category Summary</h2><p>Colony-wise breakdown har type ke liye.</p></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Total</th>
                <th>OK</th>
                <th>Under Repair</th>
                <th>Broken</th>
                <th>GPS Tagged</th>
              </tr>
            </thead>
            <tbody>
              {[...allCategories.presets.filter((c) => assets.some((a) => a.category === c.value)).map((c) => c.value),
                ...allCategories.extra.filter((slug) => assets.some((a) => a.category === slug))
              ].map((catValue) => {
                const catAssets = assets.filter((a) => a.category === catValue);
                const cat = { value: catValue, label: categoryLabel(catValue) };
                return (
                  <tr key={cat.value}>
                    <td><span className="soft-tag">{cat.label}</span></td>
                    <td><strong>{catAssets.length}</strong></td>
                    <td><span style={{ color: "#16a34a" }}>{catAssets.filter((a) => a.status === "ok" || !a.status).length}</span></td>
                    <td><span style={{ color: "#d97706" }}>{catAssets.filter((a) => a.status === "under_repair").length}</span></td>
                    <td><span style={{ color: "#dc2626" }}>{catAssets.filter((a) => a.status === "broken").length}</span></td>
                    <td>{catAssets.filter((a) => a.latitude && a.longitude).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
