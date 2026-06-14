"use client";

import type { GenericRecord } from "@/src/types";
import type { FormField } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { statusLabel } from "@/src/lib/format";
import { useModal } from "@/src/hooks/useModal";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { useToast } from "@/src/components/ui/ToastProvider";
import { Modal } from "@/src/components/ui/Modal";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { RefreshButton } from "@/src/components/ui/RefreshButton";
import { EditIcon, TrashIcon } from "@/src/components/ui/icons";
import { useState } from "react";

const MODULE_OPTIONS = [
  { value: "worker", label: "Worker / Allotment Form" },
  { value: "allotment", label: "Allotment" },
  { value: "complaint", label: "Complaint" },
  { value: "rent", label: "Rent" },
  { value: "utility", label: "Utility" },
  { value: "asset", label: "Asset" },
  { value: "eviction", label: "Eviction" },
  { value: "task", label: "Task Proof" },
];

const VISIBILITY_OPTIONS = [
  { value: "management_only", label: "Management only" },
  { value: "worker", label: "Worker" },
  { value: "finance", label: "Finance" },
  { value: "director", label: "Director" },
  { value: "caretaker", label: "Caretaker" },
];

const YES_NO = [
  { value: "true", label: "Required" },
  { value: "false", label: "Optional" },
];

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

/**
 * Superadmin control panel for the worker form requirements.
 * Each "document type" is one file input the worker form asks for — admins can
 * add new inputs, edit/enable/disable existing ones, mark them required/optional,
 * restrict allowed file types and set the maximum upload size (MB).
 */
export function DocumentTypesDashboard({
  token,
  documentTypes,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  documentTypes: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { modal, open, close } = useModal();
  const [types, setTypes] = useSyncedState(documentTypes);
  const [filter, setFilter] = useState("");
  const toast = useToast();

  const filtered = types.filter((type) =>
    !filter
      ? true
      : [type.name, type.code, type.module, type.allowed_file_type].join(" ").toLowerCase().includes(filter.toLowerCase()),
  );
  const requiredCount = types.filter((type) => type.is_required).length;
  const activeCount = types.filter((type) => type.is_active !== false).length;

  function formFields(type?: GenericRecord): FormField[] {
    return [
      { name: "name", label: "Input / Document Name", placeholder: "e.g. CNIC, Domicile, Salary Proof", required: true, defaultValue: type?.name ?? "" },
      {
        name: "code",
        label: "Code (unique)",
        placeholder: "e.g. cnic, domicile, salary_proof",
        required: true,
        defaultValue: type?.code ?? "",
        helper: "Lowercase, no spaces. Used to match uploads to this input.",
      },
      { name: "module", label: "Module / Form", type: "select", defaultValue: type?.module ?? "worker", options: MODULE_OPTIONS },
      { name: "is_required", label: "Requirement", type: "select", defaultValue: String(type?.is_required ?? false), options: YES_NO },
      {
        name: "allowed_file_type",
        label: "Allowed File Types",
        placeholder: "pdf,jpg,jpeg,png",
        defaultValue: type?.allowed_file_type ?? "pdf,jpg,jpeg,png",
        helper: "Comma separated extensions the worker can upload.",
      },
      {
        name: "max_file_size_mb",
        label: "Max Upload Size (MB)",
        type: "number",
        defaultValue: String(type?.max_file_size_mb ?? 5),
        required: true,
        helper: "Maximum file size a user can upload for this input.",
      },
      { name: "default_visibility", label: "Visibility", type: "select", defaultValue: type?.default_visibility ?? "management_only", options: VISIBILITY_OPTIONS },
      { name: "is_active", label: "Status", type: "select", defaultValue: String(type?.is_active ?? true), options: ACTIVE_OPTIONS },
      { name: "description", label: "Description", type: "textarea", placeholder: "Optional note shown to staff", defaultValue: type?.description ?? "" },
    ];
  }

  function buildPayload(data: Record<string, string>) {
    return {
      name: data.name.trim(),
      code: data.code.trim(),
      module: data.module || "worker",
      is_required: data.is_required === "true",
      allowed_file_type: (data.allowed_file_type || "pdf,jpg,jpeg,png").replace(/\s+/g, "").toLowerCase(),
      max_file_size_mb: Math.max(Number(data.max_file_size_mb || 5), 1),
      default_visibility: data.default_visibility || "management_only",
      is_active: data.is_active !== "false",
      description: data.description?.trim() || undefined,
    };
  }

  function addType() {
    open({
      type: "form",
      title: "Add Form Requirement",
      submitLabel: "Create Requirement",
      fields: formFields(),
      onSubmit: async (data) => {
        try {
          const created = await apiRequest<GenericRecord>("/document-types", token, { method: "POST", body: JSON.stringify(buildPayload(data)) });
          setTypes((prev) => [created, ...prev]);
          toast("Form requirement created successfully.", "success");
          onRefresh?.();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Could not create requirement.", "error");
        }
      },
    });
  }

  function editType(type: GenericRecord) {
    open({
      type: "form",
      title: `Edit — ${type.name}`,
      submitLabel: "Save Changes",
      fields: formFields(type),
      onSubmit: async (data) => {
        try {
          const updated = await apiRequest<GenericRecord>(`/document-types/${type.id}`, token, { method: "PUT", body: JSON.stringify(buildPayload(data)) });
          setTypes((prev) => prev.map((item) => (item.id === type.id ? { ...item, ...updated } : item)));
          toast("Form requirement updated successfully.", "success");
          onRefresh?.();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Could not update requirement.", "error");
        }
      },
    });
  }

  async function toggleActive(type: GenericRecord) {
    const nextActive = type.is_active === false;
    setTypes((prev) => prev.map((item) => (item.id === type.id ? { ...item, is_active: nextActive } : item)));
    try {
      await apiRequest(`/document-types/${type.id}`, token, { method: "PUT", body: JSON.stringify({ is_active: nextActive }) });
      toast(nextActive ? "Requirement enabled." : "Requirement disabled.", "success");
      onRefresh?.();
    } catch (error) {
      setTypes((prev) => prev.map((item) => (item.id === type.id ? { ...item, is_active: !nextActive } : item)));
      toast(error instanceof Error ? error.message : "Could not update status.", "error");
    }
  }

  function deleteType(type: GenericRecord) {
    open({
      type: "confirm",
      title: "Delete Requirement",
      message: `Delete "${type.name}"? Worker forms will stop asking for this file.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          await apiRequest(`/document-types/${type.id}`, token, { method: "DELETE" });
          setTypes((prev) => prev.filter((item) => item.id !== type.id));
          toast("Form requirement deleted.", "success");
          onRefresh?.();
        } catch (error) {
          toast(error instanceof Error ? error.message : "Could not delete requirement.", "error");
        }
      },
    });
  }

  return (
    <div className="screen-stack">
      {modal && <Modal content={modal} onClose={close} />}

      <section className="metric-grid">
        <MetricCard title="Form Inputs" value={types.length} hint="Document types configured" />
        <MetricCard title="Required" value={requiredCount} hint="Mandatory on worker form" tone="amber" />
        <MetricCard title="Active" value={activeCount} hint="Currently asked for" tone="green" />
        <MetricCard title="Optional" value={types.length - requiredCount} hint="Not mandatory" tone="purple" />
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Worker Form Requirements</h2>
            <p>Control what the worker form collects — add inputs, set required/optional, allowed file types, and max upload size.</p>
          </div>
          <div className="card-actions">
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
            <button className="primary-button" onClick={addType}>
              Add Requirement
            </button>
          </div>
        </div>

        <FilterBar
          placeholders={["Search by name / code / file type...", "", "", ""]}
          values={[filter, "", "", ""]}
          onChange={(i, v) => {
            if (i === 0) setFilter(v);
          }}
        />

        <table>
          <thead>
            <tr>
              <th>Input / Document</th>
              <th>Code</th>
              <th>Module</th>
              <th>Requirement</th>
              <th>Allowed Types</th>
              <th>Max Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr>
                <td colSpan={8}>{filter ? "No requirements match your search." : "No form requirements configured yet."}</td>
              </tr>
            ) : null}
            {filtered.map((type) => (
              <tr key={type.id}>
                <td>
                  <strong>{type.name}</strong>
                  <br />
                  <span>{type.description || "—"}</span>
                </td>
                <td className="link-cell">{type.code}</td>
                <td>{statusLabel(type.module || "worker")}</td>
                <td>
                  <StatusPill status={type.is_required ? "required" : "optional"} />
                </td>
                <td>
                  <span className="soft-tag">{type.allowed_file_type || "pdf,jpg,jpeg,png"}</span>
                </td>
                <td>
                  <strong>{type.max_file_size_mb ?? 5} MB</strong>
                </td>
                <td>
                  <StatusPill status={type.is_active === false ? "inactive" : "active"} />
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-action" onClick={() => editType(type)} aria-label={`Edit ${type.name}`} title="Edit">
                      <EditIcon />
                    </button>
                    <button onClick={() => toggleActive(type)}>{type.is_active === false ? "Enable" : "Disable"}</button>
                    <button className="icon-action danger" onClick={() => deleteType(type)} aria-label={`Delete ${type.name}`} title="Delete">
                      <TrashIcon />
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
