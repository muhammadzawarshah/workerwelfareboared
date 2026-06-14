"use client";

import { Fragment, useState } from "react";
import type { Application, GenericRecord, Flat, User, Worker } from "@/src/types";
import { apiRequest, API_BASE } from "@/src/lib/api";
import { money, statusLabel } from "@/src/lib/format";
import { applicationStatusForRole } from "@/src/lib/documents";
import { useModal } from "@/src/hooks/useModal";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { Modal } from "@/src/components/ui/Modal";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { ActionButtons } from "@/src/components/ui/ActionButtons";

export function ApplicationTable({
  applications: initial,
  workers,
  documents = [],
  notifications = [],
  flatAssignments = [],
  industries = [],
  flats = [],
  colonies = [],
  users = [],
  onAddNew,
  token,
  role,
  onRefresh,
  isRefreshing,
}: {
  applications: Application[];
  workers: Worker[];
  documents?: GenericRecord[];
  notifications?: GenericRecord[];
  flatAssignments?: GenericRecord[];
  industries?: GenericRecord[];
  flats?: Flat[];
  colonies?: GenericRecord[];
  users?: User[];
  onAddNew?: () => void;
  token?: string;
  role?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { modal, open, close } = useModal();
  const [applications, setApplications] = useSyncedState(initial);
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<"pending" | "verified" | "assigned">("pending");
  const setMessage = useToast();
  const canManageApplications = false;
  const isCaretaker = role === "care_taker_labour_colony";
  const [reviewApp, setReviewApp] = useState<Application | null>(null);
  const [forwarding, setForwarding] = useState(false);

  // Open a document in a new tab (fetch with auth → blob, since /download needs the JWT).
  async function openDocument(doc: GenericRecord) {
    try {
      const res = await fetch(`${API_BASE}/documents/${doc.id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(await res.text());
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Document open failed.");
    }
  }

  // Caretaker forwards the reviewed application up to AD (Colonies).
  async function forwardToAd(app: Application) {
    setForwarding(true);
    try {
      const updated = await apiRequest<Application>(`/worker-applications/${app.id}/forward-to-ad-colony`, token, { method: "POST", body: JSON.stringify({}) });
      setApplications((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      setMessage("Review ke baad AD (Colonies) ko forward ho gayi.");
      setReviewApp(null);
      onRefresh?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Forward failed.");
    } finally {
      setForwarding(false);
    }
  }

  const PENDING_STATUSES = ["draft", "submitted", "verification_failed", "cancelled"];
  const VERIFIED_STATUSES = ["verified", "committee_pending", "approved"];
  const ASSIGNED_STATUSES = ["flat_assigned", "closed"];

  const byTab = {
    pending: applications.filter((app) => PENDING_STATUSES.includes(app.status)),
    verified: applications.filter((app) => VERIFIED_STATUSES.includes(app.status)),
    assigned: applications.filter((app) => ASSIGNED_STATUSES.includes(app.status)),
  };

  const filtered = byTab[tab].filter((app) => {
    if (!filter) return true;
    const w = workers.find((x) => x.id === app.worker_id);
    return [app.application_no, app.application_type, app.status, w?.name, w?.cnic].join(" ").toLowerCase().includes(filter.toLowerCase());
  });

  function viewApp(app: Application) {
    const w = workers.find((x) => x.id === app.worker_id);
    open({
      type: "view",
      title: `Application — ${app.application_no}`,
      fields: [
        ["App No", app.application_no],
        ["Type", app.application_type],
        ["Status", app.status],
        ["Unit Requested", app.requested_unit_type],
        ["Date Applied", app.created_at?.slice(0, 10)],
        ["Applicant", w?.name],
        ["CNIC", w?.cnic],
        ["Designation", w?.designation],
        ["Worker Type", w?.worker_type],
      ],
    });
  }

  function viewDetailedApp(app: Application) {
    const w = workers.find((x) => x.id === app.worker_id);
    const appRecord = app as unknown as GenericRecord;
    const industry = industries.find((item) => item.id === Number(appRecord.industry_id));
    const submitter = users.find((item) => item.id === Number(appRecord.submitted_by_user_id));
    const appDocs = documents.filter((doc) => doc.application_id === app.id);
    const rejectedCount = appDocs.filter((doc) => doc.status === "rejected").length;
    const appNotifications = notifications.filter((item) => item.application_id === app.id);
    const assignment = flatAssignments.find((item) => item.application_id === app.id || item.worker_id === app.worker_id);
    const flat = flats.find((item) => item.id === Number(assignment?.flat_id));
    const colony = colonies.find((item) => item.id === Number(flat?.colony_id));
    open({
      type: "view",
      title: `Application - ${app.application_no}`,
      fields: [
        ["App No", app.application_no],
        ["Application Type", statusLabel(app.application_type)],
        ["Allotment", app.application_type === "reallotment" ? "Reassignment (previous flat cancelled / vacated)" : "New flat assignment"],
        ["Industry Note", app.remarks],
        ["Director Status", applicationStatusForRole(app, role, rejectedCount)],
        ["Workflow Status", app.status],
        ["Requested Unit", app.requested_unit_type],
        ["Date Applied", app.created_at?.slice(0, 10)],
        ["Worker Name", w?.name],
        ["Father Name", w?.father_name],
        ["CNIC", w?.cnic],
        ["Designation", w?.designation],
        ["Worker Type", w?.worker_type],
        ["Submitted By", submitter ? `${submitter.name} (${submitter.role})` : undefined],
        ["Industry", industry?.name || (submitter?.role === "industry_admin" ? "Missing industry link" : "Not linked")],
        ["Industry Registration", industry?.registration_no],
        ["Industry Contact", industry?.contact_person || industry?.phone || industry?.email],
        ["Assigned Colony", colony?.name],
        ["Assigned Flat", flat ? `${flat.flat_no} - ${flat.flat_address}` : "Not assigned"],
        ["Assignment Rent", assignment?.rent_amount !== undefined && assignment?.rent_amount !== null ? money(assignment.rent_amount) : undefined],
        ["Assignment Status", assignment?.status],
        ["Documents", appDocs.length ? appDocs.map((doc) => `${doc.original_file_name || `Document ${doc.id}`} (${statusLabel(doc.status)})`).join(" | ") : "No documents"],
        ["Notifications", appNotifications.length ? appNotifications.map((item) => `${item.title || "Notification"} (${statusLabel(item.status)})`).join(" | ") : "No notifications"],
      ],
    });
  }

  async function reuploadDocument(app: Application, doc: GenericRecord, file: File | null) {
    if (!file || !doc.document_type_id) return;
    setMessage("Reuploading rejected document...");
    const data = new FormData();
    data.append("file", file);
    data.append("document_type_id", String(doc.document_type_id));
    data.append("owner_type", doc.owner_type || "worker");
    data.append("owner_id", String(doc.owner_id || app.worker_id));
    data.append("application_id", String(app.id));
    data.append("visibility", doc.visibility || "director");
    data.append("remarks", `Reuploaded after rejection of document #${doc.id}`);
    try {
      await apiRequest("/documents/upload", token, { method: "POST", body: data });
      const verificationAdmins = users.filter((u) => u.role === "colony_section");
      await Promise.all(
        verificationAdmins.map((admin) =>
          apiRequest("/notifications", token, {
            method: "POST",
            body: JSON.stringify({
              recipient_type: "user",
              recipient_id: admin.id,
              application_id: app.id,
              title: "Document Re-uploaded",
              message: `"${doc.original_file_name || `Document #${doc.id}`}" re-uploaded for application #${app.application_no}. Please re-verify.`,
              notification_type: "document_reupload",
              status: "sent",
              sent_at: new Date().toISOString(),
            }),
          })
        )
      );
      setMessage("Document reuploaded. Verification admin has been notified.", "success");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Document reupload failed.");
    }
  }

  function changeStatus(app: Application, status: "approved" | "rejected") {
    open({
      type: "confirm",
      title: status === "approved" ? "Approve Application" : "Reject Application",
      message: `${status === "approved" ? "Approve" : "Reject"} application ${app.application_no}?`,
      confirmLabel: status === "approved" ? "Approve" : "Reject",
      danger: status === "rejected",
      onConfirm: () => {
        setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
        apiRequest(`/worker-applications/${app.id}/${status === "approved" ? "approve" : "reject"}`, token, {
          method: "POST",
          body: JSON.stringify(status === "approved" ? { remarks: "Approved from web dashboard" } : { rejected_reason: "Rejected from web dashboard" }),
        }).catch(() => {});
      },
    });
  }

  const reviewWorker = reviewApp ? workers.find((x) => x.id === reviewApp.worker_id) : undefined;
  const reviewDocs = reviewApp ? documents.filter((doc) => doc.application_id === reviewApp.id) : [];

  return (
    <section className="data-card">
      {modal && <Modal content={modal} onClose={close} />}

      {reviewApp ? (
        <div className="modal-backdrop" onClick={() => setReviewApp(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Application — #{reviewApp.application_no}</h3>
              <button className="modal-close-btn" onClick={() => setReviewApp(null)}>✕</button>
            </div>
            <div className="modal-body">
              <h4>Worker Details</h4>
              <div className="review-detail-grid">
                <div><span>Name</span><strong>{reviewWorker?.name || "—"}</strong></div>
                <div><span>Father Name</span><strong>{reviewWorker?.father_name || "—"}</strong></div>
                <div><span>CNIC</span><strong>{reviewWorker?.cnic || "—"}</strong></div>
                <div><span>Designation</span><strong>{reviewWorker?.designation || "—"}</strong></div>
                <div><span>Salary</span><strong>{reviewWorker?.salary_per_month ? money(reviewWorker.salary_per_month) : "—"}</strong></div>
                <div><span>Mobile</span><strong>{reviewWorker?.mobile_no_1 || "—"}</strong></div>
                <div><span>Requested Unit</span><strong>{reviewApp.requested_unit_type || "—"}</strong></div>
                <div><span>Allotment</span><strong>{reviewApp.application_type === "reallotment" ? "Reassignment" : "New"}</strong></div>
              </div>

              <h4 style={{ marginTop: 16 }}>Uploaded Documents ({reviewDocs.length})</h4>
              {reviewDocs.length === 0 ? (
                <p className="muted-text">Is application ke koi documents nahi.</p>
              ) : (
                <table className="review-doc-table">
                  <tbody>
                    {reviewDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.original_file_name || `Document ${doc.id}`}</td>
                        <td><StatusPill status={String(doc.status || "pending")} /></td>
                        <td><button className="ghost-button compact" onClick={() => openDocument(doc)}>Open</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="form-actions">
              <button className="ghost-button" onClick={() => setReviewApp(null)}>Cancel</button>
              <button className="primary-button" disabled={forwarding} onClick={() => forwardToAd(reviewApp)}>
                {forwarding ? "Forwarding..." : "Forward to AD Colony"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="card-title">
        <div>
          <h2>Applications</h2>
          <p>{role !== "industry_admin" ? "Track verification failures, reuploads, and committee movement" : "Track your submitted worker applications"}</p>
        </div>
        <div className="card-actions">
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
          {role === "industry_admin" ? (
            <button className="primary-button" onClick={onAddNew}>
              Add New
            </button>
          ) : null}
        </div>
      </div>
      <div className="app-tab-bar">
        <button
          type="button"
          className={tab === "pending" ? "app-tab active" : "app-tab"}
          onClick={() => { setTab("pending"); setFilter(""); }}
        >
          Pending
          <span className="app-tab-count">{byTab.pending.length}</span>
        </button>
        <button
          type="button"
          className={tab === "verified" ? "app-tab active" : "app-tab"}
          onClick={() => { setTab("verified"); setFilter(""); }}
        >
          Verified
          <span className="app-tab-count">{byTab.verified.length}</span>
        </button>
        <button
          type="button"
          className={tab === "assigned" ? "app-tab active" : "app-tab"}
          onClick={() => { setTab("assigned"); setFilter(""); }}
        >
          Flat Assigned
          <span className="app-tab-count">{byTab.assigned.length}</span>
        </button>
      </div>
      <FilterBar placeholders={["Search by name / CNIC / App No...", "All Colonies", "All Status", "Date Range"]} values={[filter, "", "", ""]} onChange={(i, v) => { if (i === 0) setFilter(v); }} />
      <table>
        <thead>
          <tr>
            <th>App. ID</th>
            <th>Applicant Name</th>
            <th>CNIC</th>
            <th>Quarter Type</th>
            <th>Status</th>
            <th>Date Applied</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!filtered.length ? (
            <tr>
              <td colSpan={7}>{filter ? "No results match your search." : "No applications found."}</td>
            </tr>
          ) : null}
          {filtered.map((app) => {
            const w = workers.find((x) => x.id === app.worker_id) || workers[0];
            const rejectedDocs = documents.filter((doc) => doc.application_id === app.id && doc.status === "rejected");
            const needsReupload = app.status === "verification_failed" || rejectedDocs.length > 0;
            const movedToCommittee = ["verified", "committee_pending"].includes(app.status);
            const displayStatus = applicationStatusForRole(app, role, rejectedDocs.length);
            return (
              <Fragment key={app.id}>
                <tr>
                  <td className="link-cell">#{app.application_no}</td>
                  <td>
                    <div className="person-cell">
                      <div className="mini-avatar">{w?.name?.slice(0, 1)}</div>
                      <div>
                        <strong>{w?.name || `Worker #${app.worker_id}`}</strong>
                        <span>{w?.designation || app.application_type}</span>
                      </div>
                    </div>
                  </td>
                  <td>{w?.cnic || "Not linked"}</td>
                  <td>
                    <span className="soft-tag">{app.requested_unit_type}</span>
                  </td>
                  <td>
                    <StatusPill status={displayStatus} />
                    {needsReupload ? <span className="rejected-doc-note">{rejectedDocs.length || 1} file rejected. Reupload required.</span> : null}
                    {movedToCommittee ? <span className="committee-doc-note">Moved to committee.</span> : null}
                  </td>
                  <td>{app.created_at?.slice(0, 10) || "2026-01-12"}</td>
                  <td>
                    <div className="action-buttons">
                      <ActionButtons
                        onView={() => (role !== "industry_admin" ? viewDetailedApp(app) : viewApp(app))}
                        onApprove={canManageApplications ? () => changeStatus(app, "approved") : undefined}
                        onReject={canManageApplications ? () => changeStatus(app, "rejected") : undefined}
                      />
                      {isCaretaker && ["submitted", "under_verification"].includes(app.status) ? (
                        <button className="primary-button compact" onClick={() => setReviewApp(app)}>Review &amp; Forward</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                {role === "industry_admin" &&
                  rejectedDocs.map((doc) => (
                    <tr key={`reupload-${doc.id}`} className="warning-row">
                      <td colSpan={4}>
                        <strong>{doc.original_file_name || `Document #${doc.id}`} rejected</strong>
                        <br />
                        <span>{doc.rejection_reason || "Please reupload this file."}</span>
                      </td>
                      <td>
                        <StatusPill status="rejected" />
                      </td>
                      <td colSpan={2}>
                        <label className="inline-file-action">
                          Reupload
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => reuploadDocument(app, doc, event.target.files?.[0] || null)} />
                        </label>
                      </td>
                    </tr>
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
