"use client";

import { useState } from "react";
import type { GenericRecord, User } from "@/src/types";
import { apiRequest, mediaUrl } from "@/src/lib/api";
import { useModal } from "@/src/hooks/useModal";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { Modal } from "@/src/components/ui/Modal";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { EditIcon, TrashIcon } from "@/src/components/ui/icons";
import { ALL_ROLES, ROLES as ROLE_IDS } from "@/src/config/roles";

const ROLES = ALL_ROLES;

const EMPTY_FORM = { name: "", email: "", password: "", confirm_password: "", phone_number: "", role: ROLE_IDS.careTakerLabourColony as string };

export function UsersDashboard({
  token,
  users: initialUsers,
  colonies = [],
  onRefresh,
  isRefreshing,
}: {
  token: string;
  users: User[];
  colonies?: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [users, setUsers] = useSyncedState(initialUsers);
  const toast = useToast();
  const { modal, open, close } = useModal();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignColonyUser, setAssignColonyUser] = useState<User | null>(null);
  const [assignColonyId, setAssignColonyId] = useState("");
  const [assigningSaving, setAssigningSaving] = useState(false);

  function pickPhoto(file: File | null) {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  function closeCreate() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setForm(EMPTY_FORM);
    setPhoto(null);
    setPhotoPreview("");
    setSubmitting(false);
    setCreateOpen(false);
  }

  async function submitCreate() {
    if (!form.name.trim()) return toast("Name is required.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast("Please enter a valid email address.", "error");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/.test(form.password)) {
      return toast("Password must be at least 12 characters with uppercase, lowercase, and a number.", "error");
    }
    if (form.password !== form.confirm_password) return toast("Password and confirm password do not match.", "error");
    if (!form.phone_number.trim()) return toast("Phone number is required.", "error");
    if (photo && !/^image\/(png|jpe?g|webp|gif)$/.test(photo.type)) return toast("Profile image must be png, jpg, jpeg or webp.", "error");

    setSubmitting(true);
    try {
      const { confirm_password: _confirm, ...payload } = form;
      void _confirm;
      let created = await apiRequest<User>("/users", token, { method: "POST", body: JSON.stringify(payload) });
      if (photo) {
        const data = new FormData();
        data.append("file", photo);
        const withPhoto = await apiRequest<User>(`/users/${created.id}/photo`, token, { method: "POST", body: data });
        created = { ...created, ...withPhoto };
      }
      setUsers((prev) => [created, ...prev]);
      toast("User created successfully.", "success");
      closeCreate();
    } catch (error) {
      setSubmitting(false);
      toast(error instanceof Error ? error.message : "User creation failed.", "error");
    }
  }

  function openAssignColony(user: User) {
    setAssignColonyUser(user);
    setAssignColonyId(user.colony_id ? String(user.colony_id) : "");
  }

  async function saveAssignColony() {
    if (!assignColonyUser) return;
    setAssigningSaving(true);
    try {
      const updated = await apiRequest<User>(`/users/${assignColonyUser.id}`, token, {
        method: "PUT",
        body: JSON.stringify({ colony_id: assignColonyId ? Number(assignColonyId) : null }),
      });
      setUsers((prev) => prev.map((u) => (u.id === assignColonyUser.id ? { ...u, colony_id: updated.colony_id ?? (assignColonyId ? Number(assignColonyId) : null) } : u)));
      toast("Colony assigned to caretaker successfully.", "success");
      setAssignColonyUser(null);
      onRefresh?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Colony assignment failed.", "error");
    } finally {
      setAssigningSaving(false);
    }
  }

  function editUser(user: User) {
    open({
      type: "form",
      title: `Edit User - ${user.name}`,
      submitLabel: "Save Changes",
      fields: [
        { name: "name", label: "Name", defaultValue: user.name, required: true },
        { name: "email", label: "Email", type: "email", defaultValue: user.email, required: true },
        { name: "phone_number", label: "Phone Number", placeholder: "03001234567" },
        { name: "role", label: "Role", type: "select", defaultValue: user.role, options: ROLES.map((role) => ({ value: role, label: role.replace(/_/g, " ") })) },
      ],
      onSubmit: async (data) => {
        try {
          const updated = await apiRequest<User>(`/users/${user.id}`, token, { method: "PUT", body: JSON.stringify(data) });
          setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...updated } : item)));
          toast("User updated successfully.", "success");
        } catch (error) {
          toast(error instanceof Error ? error.message : "User update failed.", "error");
        }
      },
    });
  }

  function deleteUser(user: User) {
    open({
      type: "confirm",
      title: "Delete User",
      message: `Delete ${user.name}?`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          await apiRequest(`/users/${user.id}`, token, { method: "DELETE" });
          setUsers((prev) => prev.filter((item) => item.id !== user.id));
          toast("User deleted successfully.", "success");
        } catch (error) {
          toast(error instanceof Error ? error.message : "User delete failed.", "error");
        }
      },
    });
  }

  return (
    <div className="screen-stack">
      {modal && <Modal content={modal} onClose={close} />}

      {assignColonyUser ? (
        <div className="modal-backdrop" onClick={() => setAssignColonyUser(null)}>
          <div className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Colony — {assignColonyUser.name}</h3>
              <button className="modal-close-btn" onClick={() => setAssignColonyUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-message">
                Select the colony this caretaker will be restricted to. They will only see data (flats, rent, tasks) from that colony.
              </p>
              <label style={{ display: "block", marginTop: 12 }}>
                <span style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Colony</span>
                <select
                  value={assignColonyId}
                  onChange={(e) => setAssignColonyId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">— No colony assigned —</option>
                  {colonies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || `Colony #${c.id}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="ghost-button" onClick={() => setAssignColonyUser(null)}>Cancel</button>
              <button className="primary-button" disabled={assigningSaving} onClick={saveAssignColony}>
                {assigningSaving ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {createOpen ? (
        <div className="modal-backdrop" onClick={closeCreate}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create User</h3>
              <button className="modal-close-btn" onClick={closeCreate}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="photo-picker">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="photo-preview" />
                ) : (
                  <div className="photo-preview placeholder">{form.name.slice(0, 1).toUpperCase() || "?"}</div>
                )}
                <label className="photo-upload-btn">
                  {photo ? "Change Photo" : "Upload Profile Photo"}
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => pickPhoto(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="modal-form-grid">
                <label>
                  Name
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="User full name" />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@example.com" />
                </label>
                <label>
                  Password
                  <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Minimum 12 characters" />
                  <small className="field-helper">At least 12 characters with uppercase, lowercase, and a number.</small>
                </label>
                <label>
                  Confirm Password
                  <input type="password" value={form.confirm_password} onChange={(e) => setForm((p) => ({ ...p, confirm_password: e.target.value }))} placeholder="Re-enter password" />
                </label>
                <label>
                  Phone Number
                  <input value={form.phone_number} onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))} placeholder="03001234567" />
                </label>
                <label>
                  Role
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="modal-footer">
                <button className="ghost-button" onClick={closeCreate}>
                  Cancel
                </button>
                <button className="primary-button" onClick={submitCreate} disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>System Users</h2>
            <p>{users.length} users</p>
          </div>
          <div className="card-actions">
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
            <button className="primary-button" onClick={() => setCreateOpen(true)}>
              Create User
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Colony</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!users.length ? (
              <tr>
                <td colSpan={6}>No users found.</td>
              </tr>
            ) : null}
            {users.map((user) => {
              const assignedColony = user.colony_id ? colonies.find((c) => c.id === user.colony_id) : null;
              return (
                <tr key={user.id}>
                  <td className="link-cell">#{user.id}</td>
                  <td>
                    <div className="person-cell">
                      {user.profile_photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(user.profile_photo)} alt={user.name} className="mini-avatar" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className="mini-avatar">{user.name.slice(0, 1)}</div>
                      )}
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <StatusPill status={user.role} />
                  </td>
                  <td>
                    {user.role === ROLE_IDS.careTakerLabourColony ? (
                      assignedColony ? (
                        <span className="soft-tag">{assignedColony.name}</span>
                      ) : (
                        <span className="muted-text">Not assigned</span>
                      )
                    ) : (
                      <span className="muted-text">—</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.role === ROLE_IDS.careTakerLabourColony ? (
                        <button
                          className="ghost-button compact"
                          onClick={() => openAssignColony(user)}
                          title="Assign colony"
                        >
                          Assign Colony
                        </button>
                      ) : null}
                      <button className="icon-action" onClick={() => editUser(user)} aria-label={`Edit ${user.name}`} title="Edit user">
                        <EditIcon />
                      </button>
                      <button className="icon-action danger" onClick={() => deleteUser(user)} aria-label={`Delete ${user.name}`} title="Delete user">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
