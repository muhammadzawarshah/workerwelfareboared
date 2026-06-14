"use client";

import { FormEvent, useState } from "react";
import type { GenericRecord } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { recordLabel } from "@/src/lib/format";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

export function DocumentsDashboard({
  token,
  documents: initialDocuments,
  documentTypes,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  documents: GenericRecord[];
  documentTypes: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [documents, setDocuments] = useSyncedState(initialDocuments);
  const setMessage = useToast();
  const [form, setForm] = useState({
    document_type_id: "",
    owner_type: "worker",
    owner_id: "",
    visibility: "director",
    remarks: "",
  });
  const [file, setFile] = useState<File | null>(null);

  async function uploadDocument(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }
    if (!form.document_type_id) {
      setMessage("Please choose document type.");
      return;
    }
    const data = new FormData();
    data.append("file", file);
    data.append("document_type_id", form.document_type_id);
    data.append("owner_type", form.owner_type);
    if (form.owner_id) data.append("owner_id", form.owner_id);
    data.append("visibility", form.visibility);
    if (form.remarks) data.append("remarks", form.remarks);
    setMessage("Uploading document...");
    try {
      const uploaded = await apiRequest<GenericRecord>("/documents/upload", token, { method: "POST", body: data });
      setDocuments((prev) => [uploaded, ...prev]);
      setMessage("Document uploaded successfully.");
      setFile(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Document upload failed.");
    }
  }

  async function documentAction(id: number, action: "verify" | "reject") {
    try {
      await apiRequest(`/documents/${id}/${action}`, token, {
        method: "POST",
        body: JSON.stringify(action === "verify" ? { remarks: "Verified from web dashboard" } : { rejection_reason: "Rejected from web dashboard" }),
      });
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, status: action === "verify" ? "approved" : "rejected" } : doc)));
      setMessage(`Document ${action === "verify" ? "verified" : "rejected"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Document action failed.");
    }
  }

  return (
    <div className="screen-stack">
      <section className="form-shell">
        <div className="form-header">
          <h2>Document Upload</h2>
          <p>Upload worker, application, complaint, or management documents.</p>
        </div>
        <form onSubmit={uploadDocument}>
          <div className="form-grid">
            <label>
              <span>Document Type</span>
              <select value={form.document_type_id} onChange={(e) => setForm((p) => ({ ...p, document_type_id: e.target.value }))} required>
                <option value="">Select type</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {recordLabel(type, `Type ${type.id}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Owner Type</span>
              <select value={form.owner_type} onChange={(e) => setForm((p) => ({ ...p, owner_type: e.target.value }))}>
                <option value="worker">Worker</option>
                <option value="allotment">Allotment</option>
                <option value="complaint">Complaint</option>
                <option value="rent_payment">Rent Payment</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="asset">Asset</option>
                <option value="task_proof">Task Proof</option>
              </select>
            </label>
            <label>
              <span>Owner ID</span>
              <input value={form.owner_id} onChange={(e) => setForm((p) => ({ ...p, owner_id: e.target.value }))} placeholder="Worker/Application ID" />
            </label>
            <label>
              <span>Visibility</span>
              <select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}>
                <option value="worker">Worker</option>
                <option value="finance">Finance</option>
                <option value="director">Director</option>
                <option value="caretaker">Caretaker</option>
              </select>
            </label>
            <label>
              <span>File</span>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </label>
            <label className="wide">
              <span>Remarks</span>
              <textarea value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Optional remarks" />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              Upload Document
            </button>
          </div>
        </form>
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Uploaded Documents</h2>
            <p>{documents.length} records</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>File</th>
              <th>Owner</th>
              <th>Visibility</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!documents.length ? (
              <tr>
                <td colSpan={6}>No documents uploaded yet.</td>
              </tr>
            ) : null}
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="link-cell">#{doc.id}</td>
                <td>
                  <strong>{doc.original_file_name || recordLabel(doc, `Document ${doc.id}`)}</strong>
                  <br />
                  <span>Type ID: {doc.document_type_id || "N/A"}</span>
                </td>
                <td>
                  {doc.owner_type || "worker"} #{doc.owner_id || "N/A"}
                </td>
                <td>{doc.visibility || "director"}</td>
                <td>
                  <StatusPill status={doc.status} />
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => documentAction(doc.id, "verify")}>Verify</button>
                    <button className="btn-reject" onClick={() => documentAction(doc.id, "reject")}>
                      Reject
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
