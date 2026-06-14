"use client";

import { useState } from "react";
import type { Application, Worker } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { money } from "@/src/lib/format";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

/**
 * Committee Desk — the chairman / secretary only DECIDE here: approve or reject.
 * The actual flat assignment + allotment notification is done afterwards by
 * AD (Colonies) on the Allotment Desk.
 */
export function CommitteeDesk({
  token,
  applications: initialApplications,
  workers,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  applications: Application[];
  workers: Worker[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [applications, setApplications] = useSyncedState(initialApplications);
  const setMessage = useToast();
  const [activeApplicationId, setActiveApplicationId] = useState<number | null>(null);
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const committeeApps = applications.filter((app) => ["verified", "committee_pending"].includes(app.status));
  const activeApp = committeeApps.find((app) => app.id === activeApplicationId) || null;
  const activeWorker = activeApp ? workers.find((item) => item.id === activeApp.worker_id) : undefined;

  async function approve(app: Application) {
    setMessage("Approving application...");
    try {
      const updated = await apiRequest<Application>(`/worker-applications/${app.id}/approve`, token, {
        method: "POST",
        body: JSON.stringify({ committee_decision: "approved", committee_remarks: remarks[app.id] || "Approved by committee" }),
      });
      setApplications((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      setMessage("Approved. AD (Colonies) ab flat assign + notification karega.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Approval failed.");
    }
  }

  async function reject(app: Application) {
    setMessage("Rejecting application...");
    try {
      const updated = await apiRequest<Application>(`/worker-applications/${app.id}/reject`, token, {
        method: "POST",
        body: JSON.stringify({ rejected_reason: remarks[app.id] || "Rejected by committee" }),
      });
      setApplications((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      setMessage("Application rejected by committee.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Committee rejection failed.");
    }
  }

  return (
    <div className="committee-layout">
      <section className="data-card committee-list-card">
        <div className="card-title">
          <div>
            <h2>Committee Desk</h2>
            <p>Committee ka faisla — approve ya reject. Flat assignment AD (Colonies) karega.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Application</th>
              <th>Worker</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!committeeApps.length ? (
              <tr>
                <td colSpan={4}>No verified applications waiting for committee.</td>
              </tr>
            ) : null}
            {committeeApps.map((app) => {
              const worker = workers.find((item) => item.id === app.worker_id);
              return (
                <tr key={app.id} className={activeApp?.id === app.id ? "selected-row" : ""}>
                  <td className="link-cell">#{app.application_no}</td>
                  <td>
                    <strong>{worker?.name || `Worker #${app.worker_id}`}</strong>
                    <br />
                    <span>{worker?.cnic || "CNIC not linked"}</span>
                  </td>
                  <td>
                    <StatusPill status={app.status} />
                  </td>
                  <td>
                    <button className="ghost-button compact" onClick={() => setActiveApplicationId(app.id)}>
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <aside className="data-card committee-assignment-panel">
        {!activeApp ? (
          <div className="empty-state">Select an application to approve or reject.</div>
        ) : (
          <>
            <div className="committee-panel-header">
              <div>
                <h2>Committee Decision</h2>
                <p>#{activeApp.application_no} - {activeWorker?.name || `Worker #${activeApp.worker_id}`}</p>
              </div>
              <StatusPill status={activeApp.status} />
            </div>
            <div className="assignment-form-grid">
              <div className="assignment-summary">
                <span>Basic Pay</span>
                <strong>{money(activeWorker?.salary_per_month)}</strong>
              </div>
              <div className="assignment-summary">
                <span>Recommended Rent</span>
                <strong>{money(activeApp.recommended_rent_amount)}</strong>
              </div>
              <label>
                <span>Committee Remarks</span>
                <textarea value={remarks[activeApp.id] || ""} onChange={(event) => setRemarks((prev) => ({ ...prev, [activeApp.id]: event.target.value }))} placeholder="Committee remarks" />
              </label>
            </div>
            <div className="form-actions">
              <button className="ghost-button" onClick={() => reject(activeApp)}>
                Reject
              </button>
              <button className="primary-button" onClick={() => approve(activeApp)}>
                Approve
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
