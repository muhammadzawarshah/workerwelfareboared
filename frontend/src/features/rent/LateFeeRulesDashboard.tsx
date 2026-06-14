"use client";

import { useState } from "react";
import type { Flat, GenericRecord, Worker } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { money } from "@/src/lib/format";
import { useToast } from "@/src/components/ui/ToastProvider";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

export function LateFeeRulesDashboard({
  token,
  lateFeeRules,
  flatAssignments,
  flats,
  workers,
  onRefresh,
  isRefreshing,
}: {
  token: string;
  lateFeeRules: GenericRecord[];
  flatAssignments: GenericRecord[];
  flats: Flat[];
  workers: Worker[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const activeRule = lateFeeRules
    .filter((rule) => rule.is_active !== false && rule.fee_type === "percentage")
    .sort((a, b) => Number(b.id) - Number(a.id))[0];
  const [percent, setPercent] = useState("");
  const setMessage = useToast();

  // Seed the percent input from the active rule when it first loads (render-phase adjustment).
  if (!percent && activeRule?.amount !== undefined) {
    setPercent(String(activeRule.amount));
  }

  const activeAssignments = flatAssignments.filter((assignment) => String(assignment.status || "active") === "active");
  const percentNumber = Number(percent || activeRule?.amount || 0);

  async function saveRule() {
    if (!percent || Number(percent) <= 0) {
      setMessage("Please enter late fee percent greater than zero.");
      return;
    }
    setMessage("Saving late fee rule...");
    try {
      await apiRequest("/late-fee-rules", token, {
        method: "POST",
        body: JSON.stringify({
          name: `Monthly rent late fee ${percent}%`,
          fee_type: "percentage",
          amount: String(percent),
          grace_days: 0,
          effective_from: new Date().toISOString().slice(0, 10),
          is_active: true,
        }),
      });
      setMessage("Late fee percent saved successfully.");
      onRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Late fee rule save failed.");
    }
  }

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Active Percent" value={percentNumber ? `${percentNumber}%` : "Not set"} hint="Extra fee on monthly rent" />
        <MetricCard title="Active Flats" value={activeAssignments.length} hint="Assigned flat rent list" tone="blue" />
        <MetricCard title="Rules Saved" value={lateFeeRules.length} hint="Historical rules" tone="green" />
        <MetricCard
          title="Total Preview"
          value={money(activeAssignments.reduce((sum, assignment) => sum + Math.round((Number(assignment.rent_amount || 0) * percentNumber) / 100), 0))}
          hint="Current calculated late fee"
          tone="amber"
        />
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Late Fee Rules</h2>
            <p>Set one percent. The fee is calculated on each worker flat assignment monthly rent.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <div className="filter-bar">
          <input type="number" min="1" value={percent} onChange={(event) => setPercent(event.target.value)} placeholder="Late fee percent" />
          <button className="primary-button" type="button" onClick={saveRule}>
            Save Percent
          </button>
          <button className="ghost-button" type="button" onClick={() => setPercent(String(activeRule?.amount || ""))}>
            Reset
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Flat</th>
              <th>Worker</th>
              <th>Monthly Rent</th>
              <th>Late Fee %</th>
              <th>Extra Fee</th>
              <th>Total If Late</th>
            </tr>
          </thead>
          <tbody>
            {!activeAssignments.length ? (
              <tr>
                <td colSpan={6}>No active flat assignments found.</td>
              </tr>
            ) : null}
            {activeAssignments.map((assignment) => {
              const flat = flats.find((item) => item.id === Number(assignment.flat_id));
              const worker = workers.find((item) => item.id === Number(assignment.worker_id));
              const rent = Number(assignment.rent_amount || 0);
              const fee = Math.round((rent * percentNumber) / 100);
              return (
                <tr key={assignment.id}>
                  <td>
                    <strong>{flat?.flat_no || `Flat #${assignment.flat_id}`}</strong>
                    <br />
                    <span>{flat?.flat_address || "Address not linked"}</span>
                  </td>
                  <td>{worker?.name || `Worker #${assignment.worker_id}`}</td>
                  <td>{money(rent)}</td>
                  <td>{percentNumber ? `${percentNumber}%` : "Not set"}</td>
                  <td className={fee > 0 ? "text-red" : ""}>{money(fee)}</td>
                  <td>{money(rent + fee)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
