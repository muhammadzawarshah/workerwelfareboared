"use client";

import { useState } from "react";
import type { Complaint, CaretakerTask, Flat, GenericRecord, GpsPing, User } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { recordLabel, statusLabel } from "@/src/lib/format";
import { useModal } from "@/src/hooks/useModal";
import { useToast } from "@/src/components/ui/ToastProvider";
import { Modal } from "@/src/components/ui/Modal";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

export function CaretakerAdminDashboard({
  token,
  complaints,
  tasks,
  users,
  assets,
  flats,
  colonies,
  gps,
  taskProofs,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  complaints: Complaint[];
  tasks: CaretakerTask[];
  users: User[];
  assets: GenericRecord[];
  flats: Flat[];
  colonies: GenericRecord[];
  gps: GpsPing[];
  taskProofs: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { modal, open, close } = useModal();
  const setMessage = useToast();

  const caretakers = users.filter((u) => u.role === "care_taker_labour_colony");
  const activeTasks = tasks.filter((t) => !["completed", "cancelled", "rejected"].includes(t.status || ""));
  const today = new Date().toISOString().slice(0, 10);
  const todayGps = gps.filter((p) => (p.recorded_at || "").slice(0, 10) === today);

  const caretakerName = (id?: number) => users.find((u) => u.id === Number(id))?.name || "Unassigned";
  const colonyName = (id?: number) => colonies.find((c) => c.id === Number(id))?.name || "-";
  const flatLabel = (id?: number) => {
    const flat = flats.find((f) => f.id === Number(id));
    return flat ? `${flat.flat_no} - ${flat.flat_address}` : "-";
  };
  const assetLabel = (id?: number) => {
    const asset = assets.find((a) => a.id === Number(id));
    return asset ? recordLabel(asset, `Asset ${asset.id}`) : "";
  };

  // ── Inline task creation form ───────────────────────────────────────────────
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskLoc, setTaskLoc] = useState<LatLng | null>(null);
  const [taskForm, setTaskForm] = useState({
    assigned_to_user_id: "",
    asset_id: "",
    flat_id: "",
    task_title: "",
    task_description: "",
    allowed_radius_meters: "100",
    due_at: "",
  });

  function resetTaskForm() {
    setTaskForm({ assigned_to_user_id: "", asset_id: "", flat_id: "", task_title: "", task_description: "", allowed_radius_meters: "100", due_at: "" });
    setTaskLoc(null);
    setShowTaskForm(false);
  }

  // When a flat is selected in the task form, auto-fill location from that flat's GPS
  function onTaskFlatChange(flatId: string) {
    setTaskForm((prev) => ({ ...prev, flat_id: flatId }));
    if (!flatId) return;
    const flat = flats.find((f) => f.id === Number(flatId)) as GenericRecord | undefined;
    if (flat?.latitude && flat?.longitude && !taskLoc) {
      setTaskLoc({ lat: Number(flat.latitude), lng: Number(flat.longitude) });
    }
  }

  // When an asset is selected in the task form, auto-fill location from that asset's GPS
  function onTaskAssetChange(assetId: string) {
    setTaskForm((prev) => ({ ...prev, asset_id: assetId }));
    if (!assetId) return;
    const asset = assets.find((a) => a.id === Number(assetId));
    if (asset?.latitude && asset?.longitude && !taskLoc) {
      setTaskLoc({ lat: Number(asset.latitude), lng: Number(asset.longitude) });
    }
  }

  async function submitTask(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!taskForm.assigned_to_user_id) { setMessage("Caretaker select karein."); return; }
    if (!taskForm.task_title) { setMessage("Task title required."); return; }
    setTaskSaving(true);
    try {
      await apiRequest("/caretaker/tasks", token, {
        method: "POST",
        body: JSON.stringify({
          assigned_to_user_id: Number(taskForm.assigned_to_user_id),
          asset_id: taskForm.asset_id ? Number(taskForm.asset_id) : undefined,
          flat_id: taskForm.flat_id ? Number(taskForm.flat_id) : undefined,
          task_title: taskForm.task_title,
          task_description: taskForm.task_description || undefined,
          target_latitude: taskLoc?.lat ?? undefined,
          target_longitude: taskLoc?.lng ?? undefined,
          allowed_radius_meters: taskForm.allowed_radius_meters ? Number(taskForm.allowed_radius_meters) : 100,
          due_at: taskForm.due_at ? new Date(taskForm.due_at).toISOString() : undefined,
          status: "assigned",
        }),
      });
      setMessage("Maintenance task created.");
      resetTaskForm();
      onRefresh?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Task create failed.");
    } finally {
      setTaskSaving(false);
    }
  }

  // ── Complaint assignment (modal, auto-populates location from flat) ──────────
  function viewComplaint(complaint: Complaint) {
    open({
      type: "view",
      title: `Complaint #${complaint.id}`,
      fields: [
        ["Description", complaint.complaint_desc],
        ["Status", complaint.status],
        ["Assigned Caretaker", caretakerName(complaint.assigned_caretaker_id)],
        ["Colony", colonyName(complaint.colony_id)],
        ["Flat", flatLabel(complaint.flat_id)],
        ["Created", complaint.created_at?.slice(0, 10)],
      ],
    });
  }

  function assignComplaint(complaint: Complaint) {
    // Auto-populate lat/lng from the flat's stored GPS if available
    const flat = complaint.flat_id ? flats.find((f) => f.id === complaint.flat_id) as GenericRecord | undefined : undefined;
    const defaultLat = flat?.latitude ? String(flat.latitude) : "";
    const defaultLng = flat?.longitude ? String(flat.longitude) : "";

    const caretakerOptions = [{ value: "", label: "Select caretaker" }, ...caretakers.map((u) => ({ value: String(u.id), label: u.name }))];
    const assetOptions = [
      { value: "", label: "No linked asset" },
      ...assets.map((a) => ({ value: String(a.id), label: `${recordLabel(a, `Asset ${a.id}`)}${a.category ? ` (${statusLabel(a.category)})` : ""}` })),
    ];

    open({
      type: "form",
      title: `Assign Complaint #${complaint.id}`,
      submitLabel: "Assign Task",
      fields: [
        { name: "assigned_caretaker_id", label: "Caretaker", type: "select", required: true, options: caretakerOptions },
        { name: "asset_id", label: "Linked Asset", type: "select", options: assetOptions },
        { name: "task_title", label: "Task Title", required: true, defaultValue: `Complaint #${complaint.id}` },
        { name: "target_latitude", label: "Target Latitude", type: "number", placeholder: "34.0000000", defaultValue: defaultLat },
        { name: "target_longitude", label: "Target Longitude", type: "number", placeholder: "71.0000000", defaultValue: defaultLng },
        { name: "allowed_radius_meters", label: "Allowed Radius (meters)", type: "number", defaultValue: "100" },
        { name: "due_at", label: "Due Date/Time", type: "datetime-local" },
      ],
      onSubmit: async (data) => {
        try {
          await apiRequest(`/complaints/${complaint.id}/assign`, token, {
            method: "POST",
            body: JSON.stringify({
              assigned_caretaker_id: Number(data.assigned_caretaker_id),
              asset_id: data.asset_id ? Number(data.asset_id) : undefined,
              task_title: data.task_title,
              target_latitude: data.target_latitude || undefined,
              target_longitude: data.target_longitude || undefined,
              allowed_radius_meters: data.allowed_radius_meters ? Number(data.allowed_radius_meters) : undefined,
              due_at: data.due_at ? new Date(data.due_at).toISOString() : undefined,
            }),
          });
          // Complaint linked to an asset → automatically mark it as broken/under_repair
          if (data.asset_id) {
            apiRequest(`/assets/${data.asset_id}/status`, token, {
              method: "POST",
              body: JSON.stringify({ status: "broken" }),
            }).catch(() => {});
          }
          setMessage(data.asset_id
            ? "Complaint assigned. Asset 'Not Working' list mein shift ho gaya."
            : "Complaint assigned and caretaker task created.");
          onRefresh?.();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Unable to assign complaint.");
        }
      },
    });
  }

  return (
    <div className="screen-stack">
      {modal && <Modal content={modal} onClose={close} />}

      <section className="metric-grid">
        <MetricCard title="Open Complaints" value={complaints.filter((c) => !["resolved", "closed"].includes(c.status)).length} hint="Visible to director admin and super admin" />
        <MetricCard title="Active Tasks" value={activeTasks.length} hint="Assigned caretaker workload" tone="amber" />
        <MetricCard title="Caretakers" value={caretakers.length} hint="Available users" tone="green" />
        <MetricCard title="Today GPS" value={todayGps.length} hint="Location history pings" tone="purple" />
      </section>

      {/* ── Inline Task Creation Form ──────────────────────────────────────────── */}
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Caretaker Admin Control</h2>
            <p>Complaints assign karein, maintenance tasks banayein — GPS location map se set karein.</p>
          </div>
          <div className="card-actions">
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
            <button className="primary-button" onClick={() => setShowTaskForm((v) => !v)}>
              {showTaskForm ? "Cancel" : "Create Task"}
            </button>
          </div>
        </div>

        {showTaskForm && (
          <form className="inline-task-form" onSubmit={submitTask}>
            <div className="form-grid">
              <label>
                <span>Caretaker *</span>
                <select required value={taskForm.assigned_to_user_id} onChange={(e) => setTaskForm((p) => ({ ...p, assigned_to_user_id: e.target.value }))}>
                  <option value="">Select caretaker</option>
                  {caretakers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </label>
              <label>
                <span>Task Title *</span>
                <input required value={taskForm.task_title} onChange={(e) => setTaskForm((p) => ({ ...p, task_title: e.target.value }))} placeholder="Street light repair" />
              </label>
              <label>
                <span>Task Details</span>
                <textarea value={taskForm.task_description} onChange={(e) => setTaskForm((p) => ({ ...p, task_description: e.target.value }))} placeholder="Repair details..." />
              </label>
              <label>
                <span>Linked Asset</span>
                <select value={taskForm.asset_id} onChange={(e) => onTaskAssetChange(e.target.value)}>
                  <option value="">No linked asset</option>
                  {assets.map((a) => <option key={a.id} value={a.id}>{recordLabel(a, `Asset ${a.id}`)} {a.category ? `(${statusLabel(a.category)})` : ""}</option>)}
                </select>
              </label>
              <label>
                <span>Linked Flat</span>
                <select value={taskForm.flat_id} onChange={(e) => onTaskFlatChange(e.target.value)}>
                  <option value="">No linked flat</option>
                  {flats.map((f) => <option key={f.id} value={f.id}>{f.flat_no} - {f.flat_address}</option>)}
                </select>
              </label>
              <label>
                <span>Allowed Radius (meters)</span>
                <input type="number" min={10} value={taskForm.allowed_radius_meters} onChange={(e) => setTaskForm((p) => ({ ...p, allowed_radius_meters: e.target.value }))} />
              </label>
              <label>
                <span>Due Date/Time</span>
                <input type="datetime-local" value={taskForm.due_at} onChange={(e) => setTaskForm((p) => ({ ...p, due_at: e.target.value }))} />
              </label>
            </div>

            <div className="form-map-section">
              <p className="form-map-label">
                Task Target Location (Map)
                {taskLoc
                  ? <span className="gps-coords-hint"> — {taskLoc.lat.toFixed(6)}, {taskLoc.lng.toFixed(6)}</span>
                  : <span className="muted-text"> — Asset/flat select karne se auto-fill hoga, ya map pe click karein</span>}
              </p>
              <LocationPicker value={taskLoc} onChange={setTaskLoc} hint="Woh exact location mark karein jahan caretaker ko kaam karna hai." />
            </div>

            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={resetTaskForm}>Cancel</button>
              <button className="primary-button" disabled={taskSaving}>
                {taskSaving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Complaint Assignment ──────────────────────────────────────────────── */}
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Complaint Assignment</h2>
            <p>Flat ki GPS set ho to location auto-populate hogi — warna manually enter karein.</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Colony / Flat</th>
              <th>Status</th>
              <th>Caretaker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length ? complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>
                  <strong>#{complaint.id}</strong>
                  <br />
                  <span>{complaint.complaint_desc}</span>
                </td>
                <td>
                  {colonyName(complaint.colony_id)}
                  <br />
                  <span>{flatLabel(complaint.flat_id)}</span>
                </td>
                <td><StatusPill status={complaint.status} /></td>
                <td>{caretakerName(complaint.assigned_caretaker_id)}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => viewComplaint(complaint)}>View</button>
                    <button onClick={() => assignComplaint(complaint)}>Assign</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5}>No complaints found.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ── Task Monitor + Proofs ─────────────────────────────────────────────── */}
      <section className="dashboard-grid wide">
        <div className="data-card">
          <div className="card-title">
            <div>
              <h2>Task Monitor</h2>
              <p>Target GPS controls whether caretaker can submit proof.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Caretaker</th>
                <th>Asset</th>
                <th>Target GPS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length ? tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.task_title || task.title || `Task ${task.id}`}</strong>
                    <br />
                    <span>{task.task_description || task.description || "-"}</span>
                  </td>
                  <td>{caretakerName(task.assigned_to_user_id)}</td>
                  <td>{assetLabel(task.asset_id) || "-"}</td>
                  <td>
                    {task.target_latitude && task.target_longitude
                      ? <span className="soft-tag gps-tag">📍 {Number(task.target_latitude).toFixed(5)}, {Number(task.target_longitude).toFixed(5)}<br />{task.allowed_radius_meters || 100}m radius</span>
                      : <span className="muted-text">No GPS target</span>}
                  </td>
                  <td><StatusPill status={task.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan={5}>No tasks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="data-card">
          <div className="card-title">
            <div>
              <h2>Proofs &amp; GPS</h2>
              <p>Latest submitted proof and location trail records.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>User</th>
                <th>Location</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {taskProofs.slice(0, 6).map((proof) => (
                <tr key={`proof-${proof.id}`}>
                  <td>
                    <strong>Proof #{proof.id}</strong>
                    <br />
                    <span>{proof.remarks || "Task proof"}</span>
                  </td>
                  <td>{caretakerName(proof.uploaded_by_user_id as number | undefined)}</td>
                  <td>{proof.latitude && proof.longitude ? `${proof.latitude}, ${proof.longitude}` : "-"}</td>
                  <td>{proof.created_at?.slice(0, 10) || "-"}</td>
                </tr>
              ))}
              {gps.slice(0, 6).map((ping) => (
                <tr key={`gps-${ping.id}`}>
                  <td>
                    <strong>GPS #{ping.id}</strong>
                    <br />
                    <span>Location ping</span>
                  </td>
                  <td>{caretakerName(ping.user_id)}</td>
                  <td>{ping.latitude}, {ping.longitude}</td>
                  <td>{ping.recorded_at?.slice(0, 16).replace("T", " ") || "-"}</td>
                </tr>
              ))}
              {!taskProofs.length && !gps.length ? (
                <tr><td colSpan={4}>No proof or GPS history found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
