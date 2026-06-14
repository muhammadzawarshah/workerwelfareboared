"use client";

import { FormEvent, useState } from "react";
import type { GenericRecord, User } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

export function IndustriesDashboard({
  token,
  industries: initialIndustries,
  users,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  industries: GenericRecord[];
  users: User[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [industries, setIndustries] = useSyncedState(initialIndustries);
  const [industryForm, setIndustryForm] = useState({ name: "", registration_no: "", address: "", contact_person: "", phone: "", email: "" });
  const [location, setLocation] = useState<LatLng | null>(null);
  const [attachForm, setAttachForm] = useState({ industry_id: "", user_id: "", designation: "", is_primary: false });
  const setMessage = useToast();

  async function createIndustry(event: FormEvent) {
    event.preventDefault();
    setMessage("Creating industry...");
    try {
      const created = await apiRequest<GenericRecord>("/industries", token, {
        method: "POST",
        body: JSON.stringify({
          name: industryForm.name,
          registration_no: industryForm.registration_no || undefined,
          address: industryForm.address || undefined,
          contact_person: industryForm.contact_person || undefined,
          phone: industryForm.phone || undefined,
          email: industryForm.email || undefined,
          latitude: location ? Number(location.lat.toFixed(7)) : undefined,
          longitude: location ? Number(location.lng.toFixed(7)) : undefined,
        }),
      });
      setIndustries((prev) => [created, ...prev]);
      setIndustryForm({ name: "", registration_no: "", address: "", contact_person: "", phone: "", email: "" });
      setLocation(null);
      setMessage("Industry created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Industry creation failed.");
    }
  }

  async function attachUser(event: FormEvent) {
    event.preventDefault();
    if (!attachForm.industry_id || !attachForm.user_id) {
      setMessage("Select industry and user first.");
      return;
    }
    setMessage("Attaching user to industry...");
    try {
      await apiRequest(`/industries/${attachForm.industry_id}/users`, token, {
        method: "POST",
        body: JSON.stringify({
          user_id: Number(attachForm.user_id),
          designation: attachForm.designation || undefined,
          is_primary: attachForm.is_primary,
        }),
      });
      setAttachForm({ industry_id: "", user_id: "", designation: "", is_primary: false });
      setMessage("User attached to industry successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "User attach failed.");
    }
  }

  return (
    <div className="screen-stack">
      <section className="form-shell">
        <div className="form-header">
          <h2>Create Industry</h2>
          <p>Director can register industries before assigning industry users.</p>
        </div>
        <form onSubmit={createIndustry}>
          <div className="form-grid">
            <label><span>Industry Name</span><input value={industryForm.name} onChange={(e) => setIndustryForm((p) => ({ ...p, name: e.target.value }))} required /></label>
            <label><span>Registration No</span><input value={industryForm.registration_no} onChange={(e) => setIndustryForm((p) => ({ ...p, registration_no: e.target.value }))} /></label>
            <label><span>Contact Person</span><input value={industryForm.contact_person} onChange={(e) => setIndustryForm((p) => ({ ...p, contact_person: e.target.value }))} /></label>
            <label><span>Phone</span><input value={industryForm.phone} onChange={(e) => setIndustryForm((p) => ({ ...p, phone: e.target.value }))} /></label>
            <label><span>Email</span><input type="email" value={industryForm.email} onChange={(e) => setIndustryForm((p) => ({ ...p, email: e.target.value }))} /></label>
            <label className="wide"><span>Address</span><textarea value={industryForm.address} onChange={(e) => setIndustryForm((p) => ({ ...p, address: e.target.value }))} /></label>
          </div>
          <div className="location-field">
            <span className="location-field-label">Industry Location — select on map</span>
            <LocationPicker value={location} onChange={setLocation} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit">
              Create Industry
            </button>
          </div>
        </form>
      </section>

      <section className="form-shell">
        <div className="form-header">
          <h2>Attach User to Industry</h2>
          <p>Create the user from Staff first, then attach that user here.</p>
        </div>
        <form onSubmit={attachUser}>
          <div className="form-grid">
            <label>
              <span>Industry</span>
              <select value={attachForm.industry_id} onChange={(e) => setAttachForm((p) => ({ ...p, industry_id: e.target.value }))} required>
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name || `Industry ${industry.id}`}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>User</span>
              <select value={attachForm.user_id} onChange={(e) => setAttachForm((p) => ({ ...p, user_id: e.target.value }))} required>
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
            </label>
            <label><span>Designation</span><input value={attachForm.designation} onChange={(e) => setAttachForm((p) => ({ ...p, designation: e.target.value }))} placeholder="HR Manager" /></label>
            <label className="checkbox-label">
              <input type="checkbox" checked={attachForm.is_primary} onChange={(e) => setAttachForm((p) => ({ ...p, is_primary: e.target.checked }))} /> Primary industry user
            </label>
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit">
              Attach User
            </button>
          </div>
        </form>
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Industries</h2>
            <p>{industries.length} registered industries</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Registration</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!industries.length ? (
              <tr>
                <td colSpan={6}>No industries found yet.</td>
              </tr>
            ) : null}
            {industries.map((industry) => (
              <tr key={industry.id}>
                <td className="link-cell">#{industry.id}</td>
                <td>
                  <strong>{industry.name}</strong>
                  <br />
                  <span>{industry.address || "No address"}</span>
                </td>
                <td>{industry.registration_no || "N/A"}</td>
                <td>
                  {industry.contact_person || "N/A"}
                  <br />
                  <span>{industry.phone || industry.email || ""}</span>
                </td>
                <td>
                  {industry.latitude && industry.longitude ? (
                    <a className="link-cell" href={`https://www.google.com/maps?q=${industry.latitude},${industry.longitude}`} target="_blank" rel="noreferrer">
                      View on map
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td>
                  <StatusPill status={industry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
