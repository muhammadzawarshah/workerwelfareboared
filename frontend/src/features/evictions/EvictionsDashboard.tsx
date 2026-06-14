"use client";

import { useState } from "react";
import type { Flat, GenericRecord, Worker } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { statusLabel } from "@/src/lib/format";
import { findDocumentTypeId } from "@/src/lib/documents";
import { useModal } from "@/src/hooks/useModal";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { Modal } from "@/src/components/ui/Modal";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

const STATUS_OPTIONS = ["illegal_identified", "notice_served", "case_filed", "hearing_pending", "order_received", "police_scheduled", "vacated", "closed", "stayed"];

export function EvictionsDashboard({
  token,
  cases: initialCases,
  hearings: initialHearings,
  workers,
  flats,
  colonies,
  flatAssignments = [],
  documentTypes,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  cases: GenericRecord[];
  hearings: GenericRecord[];
  workers: Worker[];
  flats: Flat[];
  colonies: GenericRecord[];
  flatAssignments?: GenericRecord[];
  documentTypes: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { modal, open, close } = useModal();
  const [cases, setCases] = useSyncedState(initialCases);
  const hearings = initialHearings;
  const setMessage = useToast();
  const [hearingCase, setHearingCase] = useState<GenericRecord | null>(null);
  const [hearingFile, setHearingFile] = useState<File | null>(null);
  const [hearingForm, setHearingForm] = useState({ hearing_date: new Date().toISOString().slice(0, 10), next_hearing_date: "", proceedings: "", decision_summary: "", status: "hearing_pending" });

  // ── Create case: pick colony → flat, occupant auto-fills from the active assignment ──
  const emptyCase = { colony_id: "", flat_id: "", worker_id: "", occupant_name: "", occupant_cnic: "", occupant_phone: "", status: "illegal_identified", illegal_reason: "" };
  const [showCreate, setShowCreate] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [caseForm, setCaseForm] = useState(emptyCase);

  const activeAssignmentForFlat = (flatId: number) =>
    flatAssignments.find((a) => Number(a.flat_id) === flatId && String(a.status || "active") === "active");
  const colonyFlats = caseForm.colony_id
    ? flats.filter((f) => Number(f.colony_id) === Number(caseForm.colony_id))
    : [];

  function onSelectFlat(flatId: string) {
    const assignment = flatId ? activeAssignmentForFlat(Number(flatId)) : undefined;
    const worker = assignment ? workers.find((w) => w.id === Number(assignment.worker_id)) : undefined;
    setCaseForm((p) => ({
      ...p,
      flat_id: flatId,
      worker_id: worker ? String(worker.id) : "",
      occupant_name: worker?.name || "",
      occupant_cnic: worker?.cnic || "",
      occupant_phone: worker?.mobile_no_1 || "",
    }));
  }

  async function submitCase() {
    if (!caseForm.colony_id || !caseForm.flat_id) { setMessage("Pehle colony aur flat select karein."); return; }
    if (!caseForm.occupant_name) { setMessage("Is flat ka occupant nahi mila — naam khud likhein ya doosra flat chunein."); return; }
    setCreateSaving(true);
    try {
      const created = await apiRequest<GenericRecord>("/eviction-cases", token, {
        method: "POST",
        body: JSON.stringify({
          colony_id: Number(caseForm.colony_id),
          flat_id: Number(caseForm.flat_id),
          worker_id: caseForm.worker_id ? Number(caseForm.worker_id) : undefined,
          occupant_name: caseForm.occupant_name,
          occupant_cnic: caseForm.occupant_cnic || undefined,
          occupant_phone: caseForm.occupant_phone || undefined,
          status: caseForm.status,
          illegal_reason: caseForm.illegal_reason || undefined,
        }),
      });
      setCases((prev) => [created, ...prev]);
      setShowCreate(false);
      setCaseForm(emptyCase);
      setMessage("Illegal occupant case created.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create eviction case.");
    } finally {
      setCreateSaving(false);
    }
  }

  const activeIllegal = cases.filter((item) => !["vacated", "closed"].includes(item.status || ""));
  const vacated = cases.filter((item) => item.status === "vacated");
  const courtPending = cases.filter((item) => ["case_filed", "hearing_pending", "order_received", "stayed"].includes(item.status || ""));
  const flatLabel = (id?: number) => {
    const flat = flats.find((item) => item.id === Number(id));
    return flat ? `${flat.flat_no} - ${flat.flat_address}` : "-";
  };
  const colonyName = (id?: number) => colonies.find((item) => item.id === Number(id))?.name || "-";
  const workerName = (id?: number) => workers.find((item) => item.id === Number(id))?.name || "-";
  const hearingCount = (caseId: number) => hearings.filter((item) => item.eviction_case_id === caseId).length;

  function viewCase(item: GenericRecord) {
    open({
      type: "view",
      title: `Eviction Case - ${item.occupant_name || `#${item.id}`}`,
      fields: [
        ["Occupant", item.occupant_name],
        ["CNIC", item.occupant_cnic],
        ["Phone", item.occupant_phone],
        ["Colony", colonyName(item.colony_id)],
        ["Flat", flatLabel(item.flat_id)],
        ["Linked Worker", workerName(item.worker_id)],
        ["Case No", item.case_no],
        ["Court", item.court_name],
        ["Police Station", item.police_station],
        ["District Admin", item.administration_contact],
        ["Filed Date", item.filed_date?.slice(0, 10)],
        ["Next Hearing", item.next_hearing_date?.slice(0, 10)],
        ["Status", statusLabel(item.status)],
        ["Decision", item.decision_summary],
        ["Reason", item.illegal_reason],
      ],
    });
  }

  async function updateCaseStatus(item: GenericRecord, status: string) {
    setMessage("Updating eviction case...");
    try {
      await apiRequest(`/eviction-cases/${item.id}`, token, {
        method: "PUT",
        body: JSON.stringify({ status, vacant_date: status === "vacated" ? new Date().toISOString().slice(0, 10) : undefined }),
      });
      setMessage(status === "vacated" ? "Flat marked vacant." : "Case status updated.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update case.");
    }
  }

  function openHearing(item: GenericRecord) {
    setHearingCase(item);
    setHearingFile(null);
    setHearingForm({ hearing_date: new Date().toISOString().slice(0, 10), next_hearing_date: item.next_hearing_date?.slice(0, 10) || "", proceedings: "", decision_summary: "", status: "hearing_pending" });
  }

  async function submitHearing() {
    if (!hearingCase) return;
    setMessage("Saving hearing update...");
    try {
      let documentId: number | undefined;
      if (hearingFile) {
        const documentTypeId = findDocumentTypeId(documentTypes, ["eviction", "court order", "hearing", "case document", "proof"]);
        if (!documentTypeId) {
          setMessage("Eviction/court document type is missing. Please create document type first.");
          return;
        }
        const upload = new FormData();
        upload.append("file", hearingFile);
        upload.append("document_type_id", String(documentTypeId));
        upload.append("owner_type", "eviction_case");
        upload.append("owner_id", String(hearingCase.id));
        upload.append("visibility", "director");
        upload.append("remarks", `Court hearing document for eviction case #${hearingCase.id}`);
        const doc = await apiRequest<GenericRecord>("/documents/upload", token, { method: "POST", body: upload });
        documentId = doc.id;
      }
      await apiRequest("/eviction-hearings", token, {
        method: "POST",
        body: JSON.stringify({
          eviction_case_id: hearingCase.id,
          ...hearingForm,
          document_id: documentId,
        }),
      });
      setHearingCase(null);
      setHearingFile(null);
      setMessage("Hearing update saved.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save hearing update.");
    }
  }

  return (
    <div className="screen-stack">
      {modal && <Modal content={modal} onClose={close} />}
      {hearingCase ? (
        <div className="modal-backdrop" onClick={() => setHearingCase(null)}>
          <div className="modal-box" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Hearing Update</h3>
              <button className="modal-close-btn" onClick={() => setHearingCase(null)}>
                x
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-form-grid">
                <label>
                  Hearing Date
                  <input type="date" value={hearingForm.hearing_date} onChange={(e) => setHearingForm((p) => ({ ...p, hearing_date: e.target.value }))} />
                </label>
                <label>
                  Next Hearing Date
                  <input type="date" value={hearingForm.next_hearing_date} onChange={(e) => setHearingForm((p) => ({ ...p, next_hearing_date: e.target.value }))} />
                </label>
                <label>
                  Status
                  <select value={hearingForm.status} onChange={(e) => setHearingForm((p) => ({ ...p, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Order / Decision File
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setHearingFile(e.target.files?.[0] || null)} />
                </label>
                <label className="wide">
                  Proceedings
                  <textarea value={hearingForm.proceedings} onChange={(e) => setHearingForm((p) => ({ ...p, proceedings: e.target.value }))} placeholder="Paishi/court proceedings" />
                </label>
                <label className="wide">
                  Decision Summary
                  <textarea value={hearingForm.decision_summary} onChange={(e) => setHearingForm((p) => ({ ...p, decision_summary: e.target.value }))} placeholder="Court decision / next action" />
                </label>
              </div>
              <div className="modal-footer">
                <button className="ghost-button" onClick={() => setHearingCase(null)}>
                  Cancel
                </button>
                <button className="primary-button" onClick={submitHearing}>
                  Save Hearing
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Illegal Occupant Case</h3>
              <button className="modal-close-btn" onClick={() => setShowCreate(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="modal-form-grid">
                <label>
                  Colony
                  <select
                    value={caseForm.colony_id}
                    onChange={(e) => setCaseForm((p) => ({ ...p, colony_id: e.target.value, flat_id: "", worker_id: "", occupant_name: "", occupant_cnic: "", occupant_phone: "" }))}
                  >
                    <option value="">Select colony</option>
                    {colonies.map((item) => (
                      <option key={item.id} value={item.id}>{item.name || `Colony ${item.id}`}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Flat
                  <select value={caseForm.flat_id} disabled={!caseForm.colony_id} onChange={(e) => onSelectFlat(e.target.value)}>
                    <option value="">{caseForm.colony_id ? "Select flat" : "Pehle colony chunein"}</option>
                    {colonyFlats.map((flat) => {
                      const occupied = !!activeAssignmentForFlat(flat.id);
                      return (
                        <option key={flat.id} value={flat.id}>
                          {flat.flat_no} - {flat.flat_address}{occupied ? " (occupied)" : " (empty)"}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>

              {caseForm.flat_id ? (
                caseForm.occupant_name ? (
                  <div className="task-location-hint">
                    Is flat ka registered worker: <strong>{caseForm.occupant_name}</strong>
                    {caseForm.occupant_cnic ? ` · ${caseForm.occupant_cnic}` : ""}
                    {caseForm.occupant_phone ? ` · ${caseForm.occupant_phone}` : ""}
                  </div>
                ) : (
                  <div className="task-location-hint"><span className="muted-text">Is flat par koi active worker assign nahi — occupant ka naam neeche khud likhein.</span></div>
                )
              ) : null}

              <div className="modal-form-grid">
                <label>
                  Occupant Name
                  <input value={caseForm.occupant_name} onChange={(e) => setCaseForm((p) => ({ ...p, occupant_name: e.target.value }))} placeholder="Auto from flat" />
                </label>
                <label>
                  CNIC
                  <input value={caseForm.occupant_cnic} onChange={(e) => setCaseForm((p) => ({ ...p, occupant_cnic: e.target.value }))} placeholder="Optional" />
                </label>
                <label>
                  Phone
                  <input value={caseForm.occupant_phone} onChange={(e) => setCaseForm((p) => ({ ...p, occupant_phone: e.target.value }))} placeholder="Optional" />
                </label>
                <label>
                  Status
                  <select value={caseForm.status} onChange={(e) => setCaseForm((p) => ({ ...p, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{statusLabel(status)}</option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Illegal Occupancy Reason
                  <textarea value={caseForm.illegal_reason} onChange={(e) => setCaseForm((p) => ({ ...p, illegal_reason: e.target.value }))} placeholder="Kyun illegal hai? (court/police details baad mein Hearing se add hongi)" />
                </label>
              </div>
              <div className="modal-footer">
                <button className="ghost-button" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="primary-button" disabled={createSaving} onClick={submitCase}>
                  {createSaving ? "Saving..." : "Save Case"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="metric-grid">
        <MetricCard title="Illegal Occupants" value={activeIllegal.length} hint="Active eviction cases" tone="red" />
        <MetricCard title="Court Pending" value={courtPending.length} hint="Cases under proceedings" tone="amber" />
        <MetricCard title="Vacated" value={vacated.length} hint="Flats recovered" tone="green" />
        <MetricCard title="Hearings" value={hearings.length} hint="Paishi history records" tone="purple" />
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Illegal Occupants &amp; Court Evictions</h2>
            <p>Track illegal residents, court cases, hearing updates, police/admin action, and vacant status.</p>
          </div>
          <div className="card-actions">
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
            <button className="primary-button" onClick={() => { setCaseForm(emptyCase); setShowCreate(true); }}>
              Add Case
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Occupant</th>
              <th>Flat / Colony</th>
              <th>Court Case</th>
              <th>Next Hearing</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!cases.length ? (
              <tr>
                <td colSpan={6}>No eviction cases found.</td>
              </tr>
            ) : null}
            {cases.map((item) => (
              <tr key={item.id} className={item.status === "vacated" ? "success-row" : item.status === "stayed" ? "warning-row" : ""}>
                <td>
                  <strong>{item.occupant_name || `Case #${item.id}`}</strong>
                  <br />
                  <span>{item.occupant_cnic || item.occupant_phone || "Illegal occupant"}</span>
                </td>
                <td>
                  {flatLabel(item.flat_id)}
                  <br />
                  <span>{colonyName(item.colony_id)}</span>
                </td>
                <td>
                  {item.case_no || "-"}
                  <br />
                  <span>
                    {item.court_name || "Court not added"} | {hearingCount(item.id)} hearings
                  </span>
                </td>
                <td>{item.next_hearing_date?.slice(0, 10) || "-"}</td>
                <td>
                  <StatusPill status={item.status} />
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => viewCase(item)}>View</button>
                    <button onClick={() => openHearing(item)}>Hearing</button>
                    <button onClick={() => updateCaseStatus(item, "police_scheduled")}>Police</button>
                    <button className="btn-approve" onClick={() => updateCaseStatus(item, "vacated")}>
                      Vacant
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
