import { statusLabel } from "@/src/lib/format";

export function StatusPill({ status }: { status?: string }) {
  const normalized = (status || "pending").toLowerCase();
  return <span className={`status-pill status-${normalized}`}>{statusLabel(status)}</span>;
}
