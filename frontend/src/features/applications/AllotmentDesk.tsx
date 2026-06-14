"use client";

import { useState } from "react";
import type { Application, Flat, GenericRecord, Worker } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { money } from "@/src/lib/format";
import { findDocumentTypeId } from "@/src/lib/documents";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { SearchSelect } from "@/src/components/ui/SearchSelect";

/**
 * Allotment Desk — AD (Colonies). After the committee approves an application,
 * AD (Colonies) assigns the flat and attaches the allotment notification here.
 */
export function AllotmentDesk({
  token,
  applications: initialApplications,
  workers,
  flats,
  colonies,
  flatAssignments,
  documentTypes,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  applications: Application[];
  workers: Worker[];
  flats: Flat[];
  colonies: GenericRecord[];
  flatAssignments: GenericRecord[];
  documentTypes: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [applications, setApplications] = useSyncedState(initialApplications);
  const setMessage = useToast();
  const [activeApplicationId, setActiveApplicationId] = useState<number | null>(null);
  const [selectedColony, setSelectedColony] = useState<Record<number, string>>({});
  const [colonySearch, setColonySearch] = useState<Record<number, string>>({});
  const [selectedFlat, setSelectedFlat] = useState<Record<number, string>>({});
  const [flatSearch, setFlatSearch] = useState<Record<number, string>>({});
  const [rentAmount, setRentAmount] = useState<Record<number, string>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, File | null>>({});

  // Only committee-approved applications are waiting for allotment.
  const approvedApps = applications.filter((app) => app.status === "approved");
  const assignedFlatIds = new Set(flatAssignments.filter((assignment) => String(assignment.status || "active") === "active").map((assignment) => Number(assignment.flat_id)));
  const availableFlats = flats.filter((flat) => ["empty", "reserved"].includes(String(flat.status || "empty")) && !assignedFlatIds.has(flat.id));

  async function assignFlat(app: Application) {
    const flatId = Number(selectedFlat[app.id]);
    const notificationFile = files[app.id];
    const finalRentAmount = rentAmount[app.id] || String(app.recommended_rent_amount || "");
    if (!flatId) {
      setMessage("Please select a flat before assignment.");
      return;
    }
    if (!finalRentAmount || Number(finalRentAmount) <= 0) {
      setMessage("Please set monthly rent according to worker basic pay before assignment.");
      return;
    }
    if (!notificationFile) {
      setMessage("Notification PDF/image is required before flat assignment.");
      return;
    }
    const notificationDocTypeId = findDocumentTypeId(documentTypes, ["allotment notification", "notification", "allotment order"]) || documentTypes[0]?.id;
    if (!notificationDocTypeId) {
      setMessage("Please create a document type for allotment notification first.");
      return;
    }
    setMessage("Uploading notification and assigning flat...");
    try {
      const upload = new FormData();
      upload.append("file", notificationFile);
      upload.append("document_type_id", String(notificationDocTypeId));
      upload.append("owner_type", "allotment");
      upload.append("owner_id", String(app.worker_id));
      upload.append("application_id", String(app.id));
      upload.append("visibility", "worker");
      upload.append("remarks", "Allotment notification attached by AD (Colonies)");
      await apiRequest("/documents/upload", token, { method: "POST", body: upload });
      await apiRequest("/flat-assignments", token, {
        method: "POST",
        body: JSON.stringify({
          worker_id: app.worker_id,
          flat_id: flatId,
          application_id: app.id,
          start_date: new Date().toISOString().slice(0, 10),
          rent_amount: finalRentAmount,
          remarks: remarks[app.id] || "Flat assigned by AD (Colonies)",
        }),
      });
      await apiRequest("/notifications", token, {
        method: "POST",
        body: JSON.stringify({
          recipient_type: "worker",
          recipient_id: app.worker_id,
          application_id: app.id,
          title: "Flat Assigned",
          message: `Your flat has been assigned. Please see the attached notification document.`,
          notification_type: "flat_assignment",
          status: "sent",
          sent_at: new Date().toISOString(),
        }),
      });
      setApplications((prev) => prev.map((item) => (item.id === app.id ? { ...item, status: "flat_assigned" } : item)));
      setMessage("Flat assigned and notification attached successfully.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Flat assignment failed.");
    }
  }

  const activeApp = approvedApps.find((app) => app.id === activeApplicationId) || null;
  const activeWorker = activeApp ? workers.find((item) => item.id === activeApp.worker_id) : undefined;
  const activeColonySearch = activeApp ? colonySearch[activeApp.id] || "" : "";
  const activeFlatSearch = activeApp ? flatSearch[activeApp.id] || "" : "";
  const filteredColonies = colonies.filter((colony) => {
    const haystack = [colony.name, colony.address, colony.id].join(" ").toLowerCase();
    return !activeColonySearch || haystack.includes(activeColonySearch.toLowerCase());
  });
  const filteredFlats = activeApp
    ? availableFlats.filter((flat) => {
        if (selectedColony[activeApp.id] && flat.colony_id !== Number(selectedColony[activeApp.id])) return false;
        const haystack = [flat.flat_no, flat.flat_address, flat.flat_rooms, flat.status].join(" ").toLowerCase();
        return !activeFlatSearch || haystack.includes(activeFlatSearch.toLowerCase());
      })
    : [];
  const colonyOptions = filteredColonies.map((colony) => ({ value: String(colony.id), label: colony.name || `Colony ${colony.id}` }));
  const flatOptions = filteredFlats.map((flat) => ({ value: String(flat.id), label: `${flat.flat_no} - ${flat.flat_address}` }));
  const selectedColonyLabel = activeApp ? colonies.find((colony) => String(colony.id) === selectedColony[activeApp.id])?.name : undefined;
  const selectedFlatLabel = activeApp ? availableFlats.find((flat) => String(flat.id) === selectedFlat[activeApp.id]) : undefined;
  const activeRentAmount = activeApp ? rentAmount[activeApp.id] ?? String(activeApp.recommended_rent_amount || "") : "";

  return (
    <div className="committee-layout">
      <section className="data-card committee-list-card">
        <div className="card-title">
          <div>
            <h2>Allotment Desk</h2>
            <p>Committee-approved applications — flat assign karein aur notification attach karein.</p>
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
            {!approvedApps.length ? (
              <tr>
                <td colSpan={4}>No approved applications waiting for allotment.</td>
              </tr>
            ) : null}
            {approvedApps.map((app) => {
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
                      Assign
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
          <div className="empty-state">Select an approved application to assign a flat.</div>
        ) : (
          <>
            <div className="committee-panel-header">
              <div>
                <h2>Assign Flat</h2>
                <p>#{activeApp.application_no} - {activeWorker?.name || `Worker #${activeApp.worker_id}`}</p>
              </div>
              <StatusPill status={activeApp.status} />
            </div>
            <div className="assignment-form-grid">
              <div className="assignment-summary">
                <span>Basic Pay</span>
                <strong>{money(activeWorker?.salary_per_month)}</strong>
              </div>
              <label>
                <span>Monthly Rent</span>
                <input
                  type="number"
                  min="1"
                  value={activeRentAmount}
                  onChange={(event) => setRentAmount((prev) => ({ ...prev, [activeApp.id]: event.target.value }))}
                  placeholder="Decide rent from basic pay"
                />
              </label>
              <label>
                <span>Colony</span>
                <SearchSelect
                  options={colonyOptions}
                  placeholder="Select colony"
                  searchValue={activeColonySearch}
                  selectedLabel={selectedColonyLabel}
                  onSearch={(value) => {
                    setColonySearch((prev) => ({ ...prev, [activeApp.id]: value }));
                    setSelectedColony((prev) => ({ ...prev, [activeApp.id]: "" }));
                    setSelectedFlat((prev) => ({ ...prev, [activeApp.id]: "" }));
                    setFlatSearch((prev) => ({ ...prev, [activeApp.id]: "" }));
                  }}
                  onSelect={(option) => {
                    setSelectedColony((prev) => ({ ...prev, [activeApp.id]: option.value }));
                    setColonySearch((prev) => ({ ...prev, [activeApp.id]: option.label }));
                    setSelectedFlat((prev) => ({ ...prev, [activeApp.id]: "" }));
                    setFlatSearch((prev) => ({ ...prev, [activeApp.id]: "" }));
                  }}
                />
              </label>
              <label>
                <span>Flat</span>
                <SearchSelect
                  options={flatOptions}
                  placeholder={selectedColony[activeApp.id] ? "Select flat" : "Select colony first"}
                  searchValue={activeFlatSearch}
                  selectedLabel={selectedFlatLabel ? `${selectedFlatLabel.flat_no} - ${selectedFlatLabel.flat_address}` : undefined}
                  disabled={!selectedColony[activeApp.id]}
                  onSearch={(value) => {
                    setFlatSearch((prev) => ({ ...prev, [activeApp.id]: value }));
                    setSelectedFlat((prev) => ({ ...prev, [activeApp.id]: "" }));
                  }}
                  onSelect={(option) => {
                    setSelectedFlat((prev) => ({ ...prev, [activeApp.id]: option.value }));
                    setFlatSearch((prev) => ({ ...prev, [activeApp.id]: option.label }));
                  }}
                />
              </label>
              <label>
                <span>Notification PDF / Image</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setFiles((prev) => ({ ...prev, [activeApp.id]: event.target.files?.[0] || null }))} />
              </label>
              <label>
                <span>Remarks</span>
                <textarea value={remarks[activeApp.id] || ""} onChange={(event) => setRemarks((prev) => ({ ...prev, [activeApp.id]: event.target.value }))} placeholder="Allotment remarks" />
              </label>
            </div>
            <div className="form-actions">
              <button className="primary-button" onClick={() => assignFlat(activeApp)}>
                Assign Flat
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
