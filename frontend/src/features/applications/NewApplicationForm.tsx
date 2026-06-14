"use client";

import { FormEvent, useState } from "react";
import type { Application, GenericRecord, Worker } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { useToast } from "@/src/components/ui/ToastProvider";

const FIELDS = [
  "Worker Name",
  "Father Name",
  "CNIC",
  "Date of Birth",
  "ESSI No",
  "EOBI No",
  "Designation",
  "Salary",
  "Mobile No",
  "Dependents",
  "Requested Unit Type",
] as const;

const REQUIRED = ["Worker Name", "Father Name", "CNIC", "Date of Birth"];
const REQUIRED_DOCS = ["CNIC", "Domicile", "ESSI Verification", "EOBI Verification", "Appointment Letter", "Salary Proof"];

const FIELD_HELP: Record<string, string> = {
  CNIC: "13 digits (dashes optional) — e.g. 42101-1234567-1",
  "Mobile No": "11 digits — e.g. 03001234567",
};

function fieldType(label: string) {
  if (label === "Date of Birth") return "date";
  if (label === "Salary" || label === "Dependents") return "number";
  return "text";
}

/** Returns an error string for a field, or "" when valid. */
function validateField(label: string, raw: string): string {
  const value = (raw || "").trim();
  if (REQUIRED.includes(label) && !value) return `${label} is required.`;
  if (!value) return "";

  switch (label) {
    case "CNIC": {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 13) return `CNIC must be exactly 13 digits (you entered ${digits.length}).`;
      return "";
    }
    case "Mobile No": {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 11) return `Mobile number must be 11 digits (you entered ${digits.length}).`;
      return "";
    }
    case "Salary": {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return "Salary must be a number greater than 0.";
      return "";
    }
    case "Dependents": {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0) return "Dependents must be 0 or a positive whole number.";
      return "";
    }
    case "Date of Birth": {
      const dob = new Date(value);
      if (Number.isNaN(dob.getTime())) return "Enter a valid date.";
      const today = new Date();
      if (dob > today) return "Date of birth cannot be in the future.";
      const age = (today.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) return "Worker must be at least 18 years old.";
      if (age > 100) return "Please check the date of birth.";
      return "";
    }
    default:
      return "";
  }
}

export function NewApplicationForm({ token, documentTypes, onSuccess }: { token?: string; documentTypes: GenericRecord[]; onSuccess?: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  // New allotment vs reassignment (a previously-cancelled/vacated flat going to a new worker).
  const [allotmentType, setAllotmentType] = useState<"new_allotment" | "reallotment">("new_allotment");
  const [reassignNote, setReassignNote] = useState("");

  const errors: Record<string, string> = {};
  for (const label of FIELDS) errors[label] = validateField(label, values[label] || "");

  function set(key: string, val: string) {
    setValues((p) => ({ ...p, [key]: val }));
  }
  function markTouched(key: string) {
    setTouched((p) => (p[key] ? p : { ...p, [key]: true }));
  }
  function setDoc(doc: string, file: File | null) {
    setDocs((p) => ({ ...p, [doc]: file }));
  }
  function docTypeIdFor(label: string) {
    const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "");
    return documentTypes.find((type) => {
      const name = String(type.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const code = String(type.code || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return name === normalized || code === normalized || name.includes(normalized) || code.includes(normalized);
    })?.id;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validate everything up front; show errors inline and stop before any API call.
    const firstError = FIELDS.find((label) => errors[label]);
    if (firstError) {
      setTouched(Object.fromEntries(FIELDS.map((label) => [label, true])));
      toast(`Please fix the highlighted fields. ${errors[firstError]}`, "error");
      document.getElementById(`field-${firstError}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      // Single atomic call: worker + application are created in one DB transaction
      // on the backend, so a failure can't leave a half-saved worker behind.
      const { worker, application } = await apiRequest<{ worker: Worker; application: Application }>("/worker-applications/intake", token, {
        method: "POST",
        body: JSON.stringify({
          worker: {
            name: values["Worker Name"],
            father_name: values["Father Name"],
            cnic: values.CNIC,
            dob: values["Date of Birth"],
            address: values.Address || undefined,
            essi_no: values["ESSI No"] || undefined,
            eobi_no: values["EOBI No"] || undefined,
            designation: values.Designation || undefined,
            salary_per_month: values.Salary ? Number(values.Salary) : undefined,
            mobile_no_1: values["Mobile No"] || undefined,
            total_number_dependents: values.Dependents ? Number(values.Dependents) : undefined,
            worker_type: "industry",
            status: "pending",
          },
          application: {
            application_no: `APP-${Date.now()}`,
            application_type: allotmentType,
            status: "submitted",
            requested_unit_type: values["Requested Unit Type"] || "Type-A",
            remarks: allotmentType === "reallotment"
              ? `Reassignment (previous allotment cancelled/vacated).${reassignNote.trim() ? ` ${reassignNote.trim()}` : ""}`
              : "New flat assignment.",
          },
        }),
      });

      for (const docName of REQUIRED_DOCS) {
        const file = docs[docName];
        if (!file) continue;
        const documentTypeId = docTypeIdFor(docName);
        if (!documentTypeId) continue;
        const upload = new FormData();
        upload.append("file", file);
        upload.append("document_type_id", String(documentTypeId));
        upload.append("owner_type", "worker");
        upload.append("owner_id", String(worker.id));
        upload.append("application_id", String(application.id));
        upload.append("visibility", docName === "Salary Proof" ? "finance" : "director");
        upload.append("remarks", `${docName} uploaded from allotment form`);
        await apiRequest("/documents/upload", token, { method: "POST", body: upload });
      }
      setStatus("success");
      toast("Application and documents submitted successfully.", "success");
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      setStatus("idle");
      toast(err instanceof Error ? err.message : "Submission failed. Check backend connection.", "error");
    }
  }

  if (status === "success") {
    return (
      <section className="form-shell">
        <div className="form-status-success">
          <strong>Application and documents submitted successfully!</strong> Redirecting to applications list...
        </div>
      </section>
    );
  }

  return (
    <section className="form-shell">
      <div className="form-header">
        <h2>New Allotment Application</h2>
        <p>Worker profile, eligibility, and required document uploads</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="allotment-type-bar">
          <span className="allotment-type-label">Allotment Type <em className="req-mark">*</em></span>
          <div className="allotment-type-options">
            <label className={`allotment-type-option${allotmentType === "new_allotment" ? " active" : ""}`}>
              <input type="radio" name="allotment_type" checked={allotmentType === "new_allotment"} onChange={() => setAllotmentType("new_allotment")} />
              <span><strong>New Flat Assignment</strong><small>Naya allotment — pehli dafa flat chahiye.</small></span>
            </label>
            <label className={`allotment-type-option${allotmentType === "reallotment" ? " active" : ""}`}>
              <input type="radio" name="allotment_type" checked={allotmentType === "reallotment"} onChange={() => setAllotmentType("reallotment")} />
              <span><strong>Reassignment</strong><small>Kisi aur ka allotment cancel/vacate hua, naya worker enter ho raha hai.</small></span>
            </label>
          </div>
          {allotmentType === "reallotment" ? (
            <input
              className="allotment-reassign-note"
              placeholder="Reassignment detail — e.g. flat no / kis ka cancel hua (optional)"
              value={reassignNote}
              onChange={(e) => setReassignNote(e.target.value)}
            />
          ) : null}
        </div>
        <div className="form-grid">
          {FIELDS.map((label) => {
            const showError = touched[label] && errors[label];
            return (
              <label key={label}>
                <span>
                  {label}
                  {REQUIRED.includes(label) ? <em className="req-mark"> *</em> : null}
                </span>
                <input
                  id={`field-${label}`}
                  placeholder={label}
                  value={values[label] || ""}
                  onChange={(e) => {
                    set(label, e.target.value);
                    markTouched(label);
                  }}
                  onBlur={() => markTouched(label)}
                  inputMode={label === "CNIC" || label === "Mobile No" ? "numeric" : undefined}
                  type={fieldType(label)}
                  aria-invalid={Boolean(showError)}
                />
                {FIELD_HELP[label] && !showError ? <small className="field-helper">{FIELD_HELP[label]}</small> : null}
                {showError ? <small className="field-error">{errors[label]}</small> : null}
              </label>
            );
          })}
          <label className="wide">
            <span>Address</span>
            <textarea placeholder="Residential address" value={values["Address"] || ""} onChange={(e) => set("Address", e.target.value)} />
          </label>
        </div>
        <div className="document-upload-grid">
          {REQUIRED_DOCS.map((doc) => (
            <label key={doc} className={docs[doc] ? "doc-uploaded" : ""}>
              <span>{docs[doc] ? "✓" : "+"}</span>
              {doc}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setDoc(doc, event.target.files?.[0] || null)} />
              <small>{docs[doc]?.name || "PDF, JPG, or PNG"}</small>
            </label>
          ))}
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setValues({});
              setDocs({});
              setTouched({});
              setStatus("idle");
            }}
          >
            Clear Form
          </button>
          <button type="submit" className="primary-button" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </section>
  );
}
