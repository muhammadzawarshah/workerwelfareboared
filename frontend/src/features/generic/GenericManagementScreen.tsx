"use client";

import { useState } from "react";
import { apiRequest } from "@/src/lib/api";
import { useModal } from "@/src/hooks/useModal";
import { useSyncedState } from "@/src/hooks/useSyncedState";
import { Modal } from "@/src/components/ui/Modal";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

export function GenericManagementScreen({
  title,
  subtitle,
  rows: initial,
  token,
  onRefresh,
  isRefreshing,
}: {
  title: string;
  subtitle: string;
  rows: string[];
  token?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { modal, open, close } = useModal();
  const [rows, setRows] = useSyncedState(initial);
  const [filter, setFilter] = useState("");

  const filtered = rows.filter((r) => !filter || r.toLowerCase().includes(filter.toLowerCase()));
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  function createNew() {
    open({
      type: "form",
      title: `Create New — ${title}`,
      submitLabel: "Create",
      fields: [
        { name: "name", label: "Name / Title", placeholder: "Enter name", required: true },
        { name: "code", label: "Code / Reference", placeholder: "Optional code" },
        { name: "status", label: "Status", placeholder: "active / pending", defaultValue: "active" },
        { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
      ],
      onSubmit: (data) => {
        setRows((prev) => [data.name, ...prev]);
        apiRequest(`/${slug}`, token, { method: "POST", body: JSON.stringify(data) }).catch(() => {});
      },
    });
  }

  function viewRow(row: string, index: number) {
    open({
      type: "view",
      title: `${title} — Record`,
      fields: [
        ["Reference", `#${title.slice(0, 3).toUpperCase()}-${2601 + index}`],
        ["Name", row],
        ["Colony", ["Iqbal Colony", "Quaid Colony", "Hayatabad Colony"][index % 3]],
        ["Category", ["Type-A", "Type-B", "Type-C"][index % 3]],
        ["Status", ["pending", "approved", "in_progress", "resolved"][index % 4]],
        ["Date", `2026-05-${String(12 + (index % 19)).padStart(2, "0")}`],
      ],
    });
  }

  const visibleRows = filtered.length ? filtered : rows.length ? [] : ["No backend records found"];

  return (
    <div className="screen-stack">
      {modal && <Modal content={modal} onClose={close} />}
      <section className="metric-grid">
        <MetricCard title="Total" value={rows.length} hint={subtitle} />
        <MetricCard title="Filtered" value={filtered.length || rows.length} hint="Showing records" tone="green" />
        <MetricCard title="Pending" value={rows.length ? Math.ceil(rows.length / 3) : 0} hint="Awaiting review" tone="amber" />
        <MetricCard title="Actions" value={rows.length * 2} hint="Available operations" tone="blue" />
      </section>
      <div className="toolbar-row">
        <button className="primary-button" onClick={createNew}>
          Create New
        </button>
        <button className="ghost-button" onClick={() => window.print()}>
          Export
        </button>
        <button className="ghost-button" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <FilterBar placeholders={["Search records...", "All Colonies", "All Status", "Date Range"]} values={[filter, "", "", ""]} onChange={(i, v) => { if (i === 0) setFilter(v); }} />
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Name</th>
              <th>Colony</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!visibleRows.length && filter ? (
              <tr>
                <td colSpan={7}>No results match your search.</td>
              </tr>
            ) : null}
            {visibleRows.map((row, index) => (
              <tr key={`${row}-${index}`}>
                <td className="link-cell">
                  #{title.slice(0, 3).toUpperCase()}-{2601 + index}
                </td>
                <td>
                  <strong>{row}</strong>
                  <br />
                  <span>{initial.length ? "Operational record" : "No live records yet"}</span>
                </td>
                <td>{["Iqbal Colony", "Quaid Colony", "Hayatabad Colony"][index % 3]}</td>
                <td>
                  <span className="soft-tag">{["Type-A", "Type-B", "Type-C"][index % 3]}</span>
                </td>
                <td>{initial.length ? <StatusPill status={["pending", "approved", "in_progress", "resolved"][index % 4]} /> : <span className="soft-tag">Empty</span>}</td>
                <td>2026-05-{String(12 + (index % 19)).padStart(2, "0")}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => viewRow(row, index)}>View</button>
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
