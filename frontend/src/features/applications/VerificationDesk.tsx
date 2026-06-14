"use client";

import { useState } from "react";
import type { Application, GenericRecord, Worker } from "@/src/types";
import { API_BASE, apiRequest } from "@/src/lib/api";
import { money, statusLabel } from "@/src/lib/format";
import { docsForApplication } from "@/src/lib/documents";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

export function VerificationDesk({
  token,
  applications: initialApplications,
  workers,
  documents,
  documentTypes,
  notifications = [],
  onRefresh,
  isRefreshing,
}: {
  token: string;
  applications: Application[];
  workers: Worker[];
  documents: GenericRecord[];
  documentTypes: GenericRecord[];
  notifications?: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [applications, setApplications] = useSyncedState(initialApplications);
  const showToast = useToast();
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [docStatuses, setDocStatuses] = useState<Record<number, string>>({});
  const [movedApplicationIds, setMovedApplicationIds] = useState<Record<number, boolean>>({});
  const reviewApps = applications.filter((app) => app.status !== "draft" && app.status !== "cancelled" && app.status !== "closed");
  const selectedApp = reviewApps.find((app) => app.id === selectedApplicationId);
  const selectedWorker = selectedApp ? workers.find((item) => item.id === selectedApp.worker_id) : undefined;
  const requiredDocGroups = [
    { label: "CNIC", terms: ["cnic"] },
    { label: "Domicile", terms: ["domicile"] },
    { label: "ESSI Verification", terms: ["essi"] },
    { label: "EOBI Verification", terms: ["eobi"] },
    { label: "Appointment Letter", terms: ["appointment"] },
    { label: "Salary Proof", terms: ["salary"] },
  ];
  const requiredChecks = requiredDocGroups.map((group) => {
    const docs = selectedApp ? docsForApplication(documents, selectedApp.id, documentTypes, group.terms) : [];
    const approved = docs.some((doc) => (docStatuses[doc.id] || doc.status) === "approved");
    return { ...group, docs, approved };
  });
  const allRequiredApproved = requiredChecks.every((item) => item.approved);

  async function documentVerification(doc: GenericRecord, action: "verify" | "reject") {
    showToast(`${action === "verify" ? "Approving" : "Rejecting"} document...`);
    try {
      await apiRequest(`/documents/${doc.id}/${action}`, token, {
        method: "POST",
        body: JSON.stringify(action === "verify" ? { remarks: "Approved from verification desk" } : { rejection_reason: "Rejected from verification desk" }),
      });
      setDocStatuses((prev) => ({ ...prev, [doc.id]: action === "verify" ? "approved" : "rejected" }));
      showToast(`Document ${action === "verify" ? "approved" : "rejected"}.`, action === "verify" ? "success" : "error");
      onRefresh?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Document verification failed.", "error");
    }
  }

  async function sendDocumentToDepartment(doc: GenericRecord) {
    showToast("Sending document for department verification...");
    try {
      await apiRequest(`/documents/${doc.id}`, token, {
        method: "PUT",
        body: JSON.stringify({
          status: "processing",
          remarks: "Sent to concerned department for authenticity verification.",
        }),
      });
      setDocStatuses((prev) => ({ ...prev, [doc.id]: "processing" }));
      showToast("Document marked as sent to department.", "success");
      onRefresh?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Department send failed.", "error");
    }
  }

  async function moveToCommittee(app: Application) {
    if (!allRequiredApproved) {
      showToast("Approve all required documents before moving this application to committee.", "error");
      return;
    }
    showToast("Moving application to committee...");
    try {
      const updated = await apiRequest<Application>(`/worker-applications/${app.id}/verify`, token, {
        method: "POST",
        body: JSON.stringify({
          verification_status: "passed",
          verification_remarks: "All required worker documents approved by verification desk.",
        }),
      });
      setApplications((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      setMovedApplicationIds((prev) => ({ ...prev, [app.id]: true }));
      showToast("Application moved to committee successfully.", "success");
      onRefresh?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Verification update failed.", "error");
    }
  }

  async function failApplication(app: Application) {
    showToast("Marking verification failed...");
    try {
      const updated = await apiRequest<Application>(`/worker-applications/${app.id}/reject-verification`, token, {
        method: "POST",
        body: JSON.stringify({ verification_status: "failed", verification_remarks: "One or more required documents were rejected." }),
      });
      setApplications((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      showToast("Application marked as verification failed.", "error");
      onRefresh?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Verification rejection failed.", "error");
    }
  }

  async function openDocument(doc: GenericRecord) {
    const viewer = window.open("", "_blank");
    try {
      viewer?.document.write("<p style='font-family:Arial;padding:20px'>Loading document...</p>");
      const response = await fetch(`${API_BASE}/documents/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (viewer) {
        viewer.location.href = url;
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Document open failed.";
      if (viewer) {
        viewer.document.open();
        viewer.document.write(`<p style="font-family:Arial;padding:20px;color:#b91c1c">${message}</p>`);
        viewer.document.close();
      }
      showToast(message, "error");
    }
  }

  return (
    <div className="screen-stack">
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Workers Verification</h2>
            <p>Select a worker, review details, send files to departments, then verify confirmed documents.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <div className="verification-layout">
          <aside className="verification-list">
            <h3>Worker List</h3>
            {!reviewApps.length ? <p className="muted-text">No worker applications found.</p> : null}
            {reviewApps.map((app) => {
              const worker = workers.find((item) => item.id === app.worker_id);
              const hasReupload = notifications.some(
                (n) => n.application_id === app.id && n.notification_type === "document_reupload" && n.status === "sent",
              );
              return (
                <div key={app.id} className={selectedApp?.id === app.id ? "verification-item selected" : "verification-item"}>
                  <div>
                    <strong>{worker?.name || `Worker #${app.worker_id}`}</strong>
                    <span>#{app.application_no} · {worker?.cnic || "CNIC not linked"}</span>
                  </div>
                  <div className="verification-item-footer">
                    <StatusPill status={app.status} />
                    {hasReupload ? <span className="reupload-badge">Re-uploaded</span> : null}
                    <button type="button" onClick={() => setSelectedApplicationId(app.id)}>
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </aside>
          <div className="verification-detail">
            {!selectedApp ? (
              <div className="empty-state">Click Details on a worker to review details and documents.</div>
            ) : (
              (() => {
                const movedToCommittee = movedApplicationIds[selectedApp.id] || ["verified", "committee_pending", "approved", "flat_assigned"].includes(selectedApp.status);
                return (
                  <>
                    <div className="verification-section-header">
                      <div>
                        <h3>Worker Details</h3>
                        <p>Application #{selectedApp.application_no}</p>
                      </div>
                      <StatusPill status={selectedApp.status} />
                    </div>
                    <div className="worker-detail-grid">
                      <div><span>Name</span><strong>{selectedWorker?.name || `Worker #${selectedApp.worker_id}`}</strong></div>
                      <div><span>Father Name</span><strong>{selectedWorker?.father_name || "N/A"}</strong></div>
                      <div><span>CNIC</span><strong>{selectedWorker?.cnic || "N/A"}</strong></div>
                      <div><span>Designation</span><strong>{selectedWorker?.designation || "N/A"}</strong></div>
                      <div><span>Basic Pay</span><strong>{money(selectedWorker?.salary_per_month)}</strong></div>
                      <div><span>Worker Type</span><strong>{selectedWorker?.worker_type || "industry"}</strong></div>
                      <div><span>Requested Unit</span><strong>{selectedApp.requested_unit_type || "N/A"}</strong></div>
                    </div>
                    <div className="verification-section-header">
                      <div>
                        <h3>Required Documents</h3>
                        <p>Open each file, then approve or reject it individually.</p>
                      </div>
                      <span className="soft-tag">
                        {requiredChecks.filter((item) => item.approved).length}/{requiredChecks.length} approved
                      </span>
                    </div>
                    <div className="document-review-list">
                      {requiredChecks.map((group) => (
                        <div key={group.label} className="document-review-card">
                          <div className="document-review-title">
                            <strong>{group.label}</strong>
                            <StatusPill status={group.approved ? "approved" : group.docs.length ? "pending" : "missing"} />
                          </div>
                          {!group.docs.length ? <p className="muted-text">No file uploaded for this required document.</p> : null}
                          {group.docs.map((doc) => (
                            <div key={doc.id} className="document-review-row">
                              <div>
                                <strong>{doc.original_file_name || `Document ${doc.id}`}</strong>
                                <span>{doc.mime_type || "uploaded file"} · {statusLabel(docStatuses[doc.id] || doc.status)}</span>
                              </div>
                              <div className="action-buttons">
                                <button onClick={() => openDocument(doc)}>Open</button>
                                <button onClick={() => sendDocumentToDepartment(doc)}>Send to Dept</button>
                                <button className="btn-approve" onClick={() => documentVerification(doc, "verify")}>Department Confirmed</button>
                                <button className="btn-reject" onClick={() => documentVerification(doc, "reject")}>Reject</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="form-actions">
                      <button type="button" className="ghost-button" onClick={() => failApplication(selectedApp)}>
                        Fail Verification
                      </button>
                      <button type="button" className="primary-button" disabled={!allRequiredApproved || movedToCommittee} onClick={() => moveToCommittee(selectedApp)}>
                        {movedToCommittee ? "Moved to Committee" : "Move to Committee"}
                      </button>
                    </div>
                    {!allRequiredApproved ? <p className="field-helper">Move to Committee will unlock after all required documents are approved.</p> : null}
                  </>
                );
              })()
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
