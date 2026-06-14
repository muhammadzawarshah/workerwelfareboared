"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ModalContent } from "@/src/types";
import { EyeIcon, EyeOffIcon } from "@/src/components/ui/icons";

export function Modal({ content, onClose }: { content: ModalContent; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-box${content.type === "confirm" ? " modal-sm" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{content.title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        {content.type === "view" && (
          <div className="modal-body">
            <div className="detail-grid">
              {content.fields.map(([label, value]) => (
                <div key={label} className="detail-row">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{value !== null && value !== undefined && value !== "" ? String(value) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {content.type === "confirm" && (
          <div className="modal-body">
            <p className="confirm-message">{content.message}</p>
            <div className="modal-footer">
              <button className="ghost-button" onClick={onClose}>
                Cancel
              </button>
              <button
                className={content.danger ? "danger-button" : "primary-button"}
                onClick={() => {
                  content.onConfirm();
                  onClose();
                }}
              >
                {content.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        )}
        {content.type === "form" && <ModalForm content={content} onClose={onClose} />}
      </div>
    </div>
  );
}

function ModalForm({ content, onClose }: { content: Extract<ModalContent, { type: "form" }>; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    content.fields.forEach((f) => {
      d[f.name] = f.defaultValue || "";
    });
    return d;
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(field: Extract<ModalContent, { type: "form" }>["fields"][number], value: string) {
    if (field.required && !value.trim()) return `${field.label} is required.`;
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
    if (field.minLength && value.length < field.minLength) return `${field.label} must be at least ${field.minLength} characters.`;
    if (field.pattern && value && !new RegExp(field.pattern).test(value)) return `${field.label} must include uppercase, lowercase, and number.`;
    if (field.name === "confirm_password" && value !== values.password) return "Confirm password must match password.";
    return "";
  }

  function updateValue(field: Extract<ModalContent, { type: "form" }>["fields"][number], value: string) {
    setValues((previous) => ({ ...previous, [field.name]: value }));
    setFieldErrors((previous) => {
      if (!previous[field.name]) return previous;
      const next = { ...previous };
      delete next[field.name];
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    content.fields.forEach((field) => {
      const error = validateField(field, values[field.name] || "");
      if (error) nextErrors[field.name] = error;
    });
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    content.onSubmit(values);
    onClose();
  }

  return (
    <form className="modal-body modal-form" onSubmit={handleSubmit} noValidate>
      <div className="modal-form-grid">
        {content.fields.map((field) => (
          <label key={field.name} className={field.type === "textarea" ? "wide" : ""}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea placeholder={field.placeholder} value={values[field.name]} onChange={(e) => updateValue(field, e.target.value)} />
            ) : field.type === "select" ? (
              <select value={values[field.name]} onChange={(e) => updateValue(field, e.target.value)}>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "password" ? (
              <span className="password-input-wrap">
                <input
                  type={visiblePasswords[field.name] ? "text" : "password"}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(e) => updateValue(field, e.target.value)}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                />
                <button
                  type="button"
                  className="password-eye-button"
                  aria-label={visiblePasswords[field.name] ? "Hide password" : "Show password"}
                  title={visiblePasswords[field.name] ? "Hide password" : "Show password"}
                  onClick={() => setVisiblePasswords((p) => ({ ...p, [field.name]: !p[field.name] }))}
                >
                  {visiblePasswords[field.name] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </span>
            ) : (
              <input
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(e) => updateValue(field, e.target.value)}
                aria-invalid={Boolean(fieldErrors[field.name])}
              />
            )}
            {field.helper ? <small className="field-helper">{field.helper}</small> : null}
            {fieldErrors[field.name] ? <small className="field-error">{fieldErrors[field.name]}</small> : null}
          </label>
        ))}
      </div>
      <div className="modal-footer">
        <button type="button" className="ghost-button" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="primary-button">
          {content.submitLabel || "Save"}
        </button>
      </div>
    </form>
  );
}
