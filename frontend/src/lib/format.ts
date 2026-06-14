import type { GenericRecord } from "@/src/types";

/** Format a numeric value as PKR currency. */
export function money(value: string | number | undefined) {
  const numeric = Number(value || 0);
  return `Rs. ${numeric.toLocaleString("en-PK")}`;
}

/** Safely coerce an unknown API value into an array. */
export function asArray<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}

/** Pick the most meaningful human label from a loosely-typed record. */
export function recordLabel(record: GenericRecord, fallback: string) {
  return (
    record.name ||
    record.title ||
    record.document_name ||
    record.code ||
    record.email ||
    record.action ||
    record.entity_type ||
    fallback
  );
}

/** Turn a snake_case status into a readable label. */
export function statusLabel(status?: string) {
  return (status || "pending").replace(/_/g, " ");
}

/** Normalize text to lowercase alphanumerics for fuzzy matching. */
export function normalizedText(value?: string | number) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
