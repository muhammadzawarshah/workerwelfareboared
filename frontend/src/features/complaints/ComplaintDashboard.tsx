"use client";

import { useState } from "react";
import type { Complaint, DataProps, GenericRecord, User } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { findDocumentTypeId } from "@/src/lib/documents";
import { statusLabel } from "@/src/lib/format";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { useModal } from "@/src/hooks/useModal";
import { Modal } from "@/src/components/ui/Modal";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

const ASSET_CATS = [
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

export function ComplaintDashboard({
  complaints: initial,
  workers,
  token,
  assets = [],
  colonies = [],
  users = [],
  documentTypes = [],
  onRefresh,
  isRefreshing,
}: Pick<DataProps, "complaints" | "workers"> & {
  token?: string;
  assets?: GenericRecord[];
  colonies?: GenericRecord[];
  users?: User[];
  documentTypes?: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { modal, open, close } = useModal();
  const toast = useToast();
  const [complaints, setComplaints] = useSyncedState(initial);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Add complaint form state ─────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [cType, setCType] = useState<"asset" | "general">("asset");
  const [cAssetType, setCAssetType] = useState("street_light");
  const [cColony, setCColony] = useState("");
  const [cFlat, setCFlat] = useState("");
  const [cWorker, setCWorker] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cLoc, setCLoc] = useState<LatLng | null>(null);

  // ── Verify-done (resolution proof) state ─────────────────────────────────────
  const [verifyComplaintId, setVerifyComplaintId] = useState<number | null>(null);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [verifySaving, setVerifySaving] = useState(false);
  const verifyTarget = complaints.find((c) => c.id === verifyComplaintId) || null;

  function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error("Browser location is not available.")); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
    });
  }

  function openVerify(c: Complaint) {
    setVerifyComplaintId(c.id);
    setVerifyFile(null);
    setVerifyRemarks("");
  }

  async function submitVerification() {
    if (!verifyTarget) return;
    if (!verifyFile) { toast("Done picture upload karein.", "error"); return; }
    setVerifySaving(true);
    try {
      // The complaint's location is checked only when one was pinned at filing.
      let coords: { latitude?: number; longitude?: number } = {};
      if (verifyTarget.latitude && verifyTarget.longitude) {
        toast("Aapki location li ja rahi hai...");
        const pos = await getPosition();
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }
      const docTypeId = findDocumentTypeId(documentTypes, ["complaint proof", "task proof", "maintenance proof", "repair proof", "proof"]) || documentTypes[0]?.id;
      if (!docTypeId) { toast("Proof document type missing — pehle ek banayein.", "error"); setVerifySaving(false); return; }
      const upload = new FormData();
      upload.append("file", verifyFile);
      upload.append("document_type_id", String(docTypeId));
      upload.append("owner_type", "complaint");
      upload.append("owner_id", String(verifyTarget.id));
      upload.append("visibility", "caretaker");
      upload.append("remarks", verifyRemarks || "Complaint resolution proof");
      const doc = await apiRequest<GenericRecord>("/documents/upload", token, { method: "POST", body: upload });
      await apiRequest(`/complaints/${verifyTarget.id}/resolve`, token, {
        method: "POST",
        body: JSON.stringify({ image_document_id: doc.id, ...coords, resolution_remarks: verifyRemarks || undefined }),
      });
      setComplaints((prev) => prev.map((x) => (x.id === verifyTarget.id ? { ...x, status: "resolved" } : x)));
      toast("Complaint verify ho gayi — kaam done mark ho gaya.", "success");
      setVerifyComplaintId(null); setVerifyFile(null); setVerifyRemarks("");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Verification failed.", "error");
    } finally {
      setVerifySaving(false);
    }
  }

  const caretakers = users.filter((u) => u.role === "care_taker_labour_colony");
  const admins = users.filter((u) => ["works_wing", "super_admin", "admin", "director_admin"].includes(u.role));

  const filtered = complaints.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (!filter) return true;
    const w = workers.find((x) => x.id === c.worker_id);
    return [c.complaint_desc, c.status, c.complaint_type, w?.name, w?.cnic].join(" ").toLowerCase().includes(filter.toLowerCase());
  });

  const pending    = complaints.filter((c) => c.status === "pending" || c.status === "open").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved   = complaints.filter((c) => c.status === "resolved" || c.status === "closed").length;
  const assetComplaints = complaints.filter((c) => c.complaint_type === "asset" || c.complaint_desc?.startsWith("[Asset:")).length;

  // ── Submit new complaint ─────────────────────────────────────────────────────
  async function submitComplaint(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!cDesc.trim()) { toast("Description required.", "error"); return; }
    setFormSaving(true);
    try {
      const assetLabel = ASSET_CATS.find((c) => c.value === cAssetType)?.label || cAssetType;
      const descText = cType === "asset"
        ? `[Asset: ${assetLabel}] ${cDesc.trim()}`
        : cDesc.trim();
      const created = await apiRequest<Complaint>("/complaints", token, {
        method: "POST",
        body: JSON.stringify({
          complaint_desc: descText,
          complaint_type: cType,
          colony_id: cColony ? Number(cColony) : undefined,
          flat_id: cFlat ? Number(cFlat) : undefined,
          worker_id: cWorker ? Number(cWorker) : undefined,
          latitude: cLoc?.lat ?? undefined,
          longitude: cLoc?.lng ?? undefined,
        }),
      });
      setComplaints((prev) => [created, ...prev]);
      setCDesc(""); setCLoc(null); setCType("asset"); setCAssetType("street_light");
      setCColony(""); setCFlat(""); setCWorker("");
      setShowForm(false);
      toast("Complaint darj ho gayi.", "success");
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Complaint submit failed.", "error");
    } finally {
      setFormSaving(false);
    }
  }

  // ── Forward complaint to admin ───────────────────────────────────────────────
  function forwardComplaint(c: Complaint) {
    const options = [
      { value: "", label: "Select admin / caretaker" },
      ...admins.map((u) => ({ value: String(u.id), label: `${u.name} (${statusLabel(u.role)})` })),
      ...caretakers.map((u) => ({ value: String(u.id), label: `${u.name} (Caretaker)` })),
    ];
    open({
      type: "form",
      title: `Forward Complaint #${c.id}`,
      submitLabel: "Forward",
      fields: [
        { name: "assigned_caretaker_id", label: "Forward To", type: "select", required: true, options },
        { name: "task_title", label: "Task Title", required: true, defaultValue: `Complaint #${c.id}` },
        { name: "due_at", label: "Due Date/Time", type: "datetime-local" },
      ],
      onSubmit: async (data) => {
        try {
          await apiRequest(`/complaints/${c.id}/assign`, token, {
            method: "POST",
            body: JSON.stringify({
              assigned_caretaker_id: Number(data.assigned_caretaker_id),
              task_title: data.task_title,
              due_at: data.due_at ? new Date(data.due_at).toISOString() : undefined,
            }),
          });
          setComplaints((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "in_progress" } : x)));
          toast("Complaint forward ho gayi — assigned user ko task create ho gaya.", "success");
          onRefresh?.();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Forward failed.", "error");
        }
      },
    });
  }

  // ── View complaint ───────────────────────────────────────────────────────────
  function viewComplaint(c: Complaint) {
    const w = workers.find((x) => x.id === c.worker_id);
    const col = colonies.find((x) => x.id === c.colony_id);
    const asset = assets.find((x) => x.id === c.asset_id);
    open({
      type: "view",
      title: `Complaint #CMP-${1040 + c.id}`,
      fields: [
        ["Type", c.complaint_type ? statusLabel(c.complaint_type) : "General"],
        ["Description", c.complaint_desc],
        ["Status", c.status],
        ["Colony", col?.name || "-"],
        ["Worker", w?.name || "-"],
        ["Asset", asset ? (asset.name || `Asset #${asset.id}`) : "-"],
        ["Location", c.latitude && c.longitude ? `${Number(c.latitude).toFixed(5)}, ${Number(c.longitude).toFixed(5)}` : "—"],
        ["Date Reported", c.created_at?.slice(0, 10) || "—"],
      ],
    });
  }


  function complaintTypeTag(c: Complaint) {
    if (c.complaint_type === "asset" || c.complaint_desc?.startsWith("[Asset:")) {
      return <span className="soft-tag" style={{ background: "#fef3c7", color: "#92400e" }}>Asset</span>;
    }
    return <span className="soft-tag">General</span>;
  }

  return (
    <div className="screen-stack">
      {modal && <Modal content={modal} onClose={close} />}

      {verifyTarget ? (
        <div className="modal-backdrop" onClick={() => setVerifyComplaintId(null)}>
          <div className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Verify Done — #CMP-{1040 + verifyTarget.id}</h3>
              <button className="modal-close-btn" onClick={() => setVerifyComplaintId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-message">{verifyTarget.complaint_desc?.replace(/^\[Asset:[^\]]+\]\s*/, "")}</p>
              {verifyTarget.latitude && verifyTarget.longitude ? (
                <div className="task-location-hint">
                  <strong>Site:</strong> {Number(verifyTarget.latitude).toFixed(5)}, {Number(verifyTarget.longitude).toFixed(5)}
                  {" "}· {verifyTarget.allowed_radius_meters || 100}m radius
                  <span className="muted-text"> — aap isi jagah par hone chahye; GPS check hoga.</span>
                </div>
              ) : (
                <div className="task-location-hint"><span className="muted-text">Is complaint ki location set nahi — sirf done picture chahye.</span></div>
              )}
              <div className="completion-form">
                <label>
                  Done Picture / Video <em className="req-mark">*</em>
                  <input type="file" accept="image/*,video/*" onChange={(e) => setVerifyFile(e.target.files?.[0] || null)} />
                  <span className="muted-text">Kaam complete hone ke baad image ya video upload karein — management check karega.</span>
                </label>
                <label>
                  Remarks
                  <textarea value={verifyRemarks} onChange={(e) => setVerifyRemarks(e.target.value)} placeholder="Kaam ka detail (optional)" rows={2} />
                </label>
              </div>
              <div className="modal-footer">
                <button className="ghost-button" onClick={() => setVerifyComplaintId(null)}>Cancel</button>
                <button className="primary-button" disabled={verifySaving} onClick={submitVerification}>
                  {verifySaving ? "Verifying..." : "Capture Location & Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="metric-grid">
        <MetricCard title="Total Complaints" value={complaints.length} hint="Complaint register" />
        <MetricCard title="Pending / Open" value={pending} hint="Awaiting action" tone="amber" />
        <MetricCard title="In Progress" value={inProgress} hint="Assigned work" tone="blue" />
        <MetricCard title="Resolved" value={resolved} hint="Closed cases" tone="green" />
        <MetricCard title="Asset Complaints" value={assetComplaints} hint="Infrastructure issues" tone="red" />
      </section>

      {/* ── Add Complaint Form ─────────────────────────────────────────────────── */}
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Complaint Register</h2>
            <p>Asset ya general masla — darj karein aur admin/caretaker ko forward karein.</p>
          </div>
          <div className="card-actions">
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
            <button
              type="button"
              className={showForm ? "ghost-button" : "primary-button"}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Cancel" : "New Complaint"}
            </button>
          </div>
        </div>

        {showForm && (
          <form className="complaint-inline-form" onSubmit={submitComplaint}>
            <div className="form-grid">
              <label>
                <span>Complaint Type</span>
                <select value={cType} onChange={(e) => setCType(e.target.value as "asset" | "general")}>
                  <option value="asset">Asset Problem (street light, pump, road...)</option>
                  <option value="general">General Complaint</option>
                </select>
              </label>

              {cType === "asset" && (
                <label>
                  <span>Asset Type</span>
                  <select value={cAssetType} onChange={(e) => setCAssetType(e.target.value)}>
                    {ASSET_CATS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
              )}

              {colonies.length > 0 && (
                <label>
                  <span>Colony</span>
                  <select value={cColony} onChange={(e) => setCColony(e.target.value)}>
                    <option value="">— Select colony —</option>
                    {colonies.map((col) => (
                      <option key={col.id} value={col.id}>{col.name || `Colony #${col.id}`}</option>
                    ))}
                  </select>
                </label>
              )}

              {cType === "general" && workers.length > 0 && (
                <label>
                  <span>Worker (optional)</span>
                  <select value={cWorker} onChange={(e) => setCWorker(e.target.value)}>
                    <option value="">— No specific worker —</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.cnic})</option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                <span>Description <em className="req-mark">*</em></span>
                <textarea
                  required
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder={cType === "asset" ? "Kya masla hai? Kab se hai?" : "Complaint details..."}
                  rows={3}
                />
              </label>
            </div>

            {cType === "asset" && (
              <div className="form-map-section">
                <p className="form-map-label">
                  Asset Location (Map)
                  {cLoc
                    ? <span className="gps-coords-hint"> — {cLoc.lat.toFixed(6)}, {cLoc.lng.toFixed(6)}</span>
                    : <span className="muted-text"> — Map pe us jagah ka pin lagayein jahan asset kharab hai</span>}
                </p>
                <LocationPicker value={cLoc} onChange={setCLoc} hint="Jo asset kharab hai us ki location — caretaker ko task assign karne mein kaam aayega." />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="primary-button" disabled={formSaving}>
                {formSaving ? "Submitting..." : "Complaint Submit Karein"}
              </button>
            </div>
          </form>
        )}

        {/* ── Filter bar ──────────────────────────────────────────────────────── */}
        <div className="filter-bar" style={{ flexWrap: "wrap", gap: 8, marginTop: showForm ? 16 : 0 }}>
          <input
            className="search-input"
            placeholder="Search complaints..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: 200 }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          {(filter || statusFilter) && (
            <button className="ghost-button compact" onClick={() => { setFilter(""); setStatusFilter(""); }}>✕ Clear</button>
          )}
          <span className="soft-tag">{filtered.length} Records</span>
        </div>

        {/* ── Complaints table ─────────────────────────────────────────────────── */}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Colony</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr><td colSpan={7}>{filter || statusFilter ? "No results match filter." : "No complaints found."}</td></tr>
            ) : null}
            {filtered.map((c) => {
              const col = colonies.find((x) => x.id === c.colony_id);
              return (
                <tr key={c.id}>
                  <td className="link-cell">#CMP-{1040 + c.id}</td>
                  <td>{complaintTypeTag(c)}</td>
                  <td>
                    <span>{c.complaint_desc?.replace(/^\[Asset:[^\]]+\]\s*/, "").slice(0, 60)}</span>
                  </td>
                  <td>{col?.name || (c.colony_id ? `Colony #${c.colony_id}` : "—")}</td>
                  <td>
                    {c.latitude && c.longitude
                      ? <span className="soft-tag gps-tag">📍 {Number(c.latitude).toFixed(4)}, {Number(c.longitude).toFixed(4)}</span>
                      : <span className="muted-text">—</span>}
                  </td>
                  <td><StatusPill status={c.status} /></td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => viewComplaint(c)}>View</button>
                      <button onClick={() => forwardComplaint(c)}>Forward</button>
                      {c.status === "resolved" || c.status === "closed" ? (
                        <button className="btn-approve" disabled>Verified</button>
                      ) : (
                        <button className="btn-approve" onClick={() => openVerify(c)}>Verify Done</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ── Urgent sidebar panel ─────────────────────────────────────────────── */}
      <section className="content-split">
        <div className="data-card">
          <div className="card-title"><h2>Asset Complaints</h2></div>
          <table>
            <thead>
              <tr><th>ID</th><th>Asset</th><th>Description</th><th>Status</th></tr>
            </thead>
            <tbody>
              {complaints
                .filter((c) => c.complaint_type === "asset" || c.complaint_desc?.startsWith("[Asset:"))
                .slice(0, 8)
                .map((c) => {
                  const assetMatch = c.complaint_desc?.match(/^\[Asset:\s*([^\]]+)\]/);
                  return (
                    <tr key={c.id}>
                      <td>#CMP-{1040 + c.id}</td>
                      <td><span className="soft-tag">{assetMatch?.[1] || "Asset"}</span></td>
                      <td>{c.complaint_desc?.replace(/^\[Asset:[^\]]+\]\s*/, "").slice(0, 50)}</td>
                      <td><StatusPill status={c.status} /></td>
                    </tr>
                  );
                })}
              {!complaints.filter((c) => c.complaint_type === "asset" || c.complaint_desc?.startsWith("[Asset:")).length && (
                <tr><td colSpan={4}>No asset complaints yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="side-panel">
          <h3>Pending Complaints</h3>
          {complaints
            .filter((c) => c.status !== "resolved" && c.status !== "closed")
            .slice(0, 5)
            .map((item) => (
              <div className="alert-item" key={item.id} style={{ cursor: "pointer" }} onClick={() => viewComplaint(item)}>
                <strong>{item.complaint_desc.replace(/^\[Asset:[^\]]+\]\s*/, "").slice(0, 45)}</strong>
                <span>
                  {item.complaint_type === "asset" ? "Asset · " : ""}
                  #CMP-{1040 + item.id} · {item.created_at?.slice(0, 10)}
                </span>
              </div>
            ))}
          {!complaints.filter((c) => c.status !== "resolved" && c.status !== "closed").length && (
            <p className="muted-text">No pending complaints.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
