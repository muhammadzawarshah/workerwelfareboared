"use client";

import { useState } from "react";
import type { Flat, GenericRecord, Worker } from "@/src/types";
import { money } from "@/src/lib/format";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

export function RentRatesDashboard({
  colonies,
  flats,
  workers,
  flatAssignments,
  onRefresh,
  isRefreshing,
}: {
  colonies: GenericRecord[];
  flats: Flat[];
  workers: Worker[];
  flatAssignments: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [selectedColonyId, setSelectedColonyId] = useState("");
  const [filter, setFilter] = useState("");

  // Default the colony filter to the first colony once data loads (render-phase adjustment).
  if (!selectedColonyId && colonies.length) {
    setSelectedColonyId(String(colonies[0].id));
  }

  const selectedColony = colonies.find((item) => item.id === Number(selectedColonyId));
  const colonyFlats = flats
    .filter((flat) => flat.colony_id === Number(selectedColonyId))
    .filter((flat) => [flat.flat_no, flat.flat_address, flat.status].join(" ").toLowerCase().includes(filter.toLowerCase()));
  const colonyFlatIds = new Set(colonyFlats.map((flat) => flat.id));
  const activeAssignments = flatAssignments.filter((assignment) => String(assignment.status || "active") === "active" && colonyFlatIds.has(Number(assignment.flat_id)));
  const configuredRentCount = activeAssignments.filter((assignment) => Number(assignment.rent_amount || 0) > 0).length;

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Colonies" value={colonies.length} hint="Available colonies" />
        <MetricCard title="Flats" value={colonyFlats.length} hint={selectedColony?.name || "Select colony"} tone="blue" />
        <MetricCard title="Active Allotments" value={activeAssignments.length} hint="Assigned flats" tone="green" />
        <MetricCard title="Rent Finalized" value={configuredRentCount} hint="Assignment-time rent" tone="amber" />
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Assignment Rent Register</h2>
            <p>Rent is finalized during flat assignment after checking worker basic pay.</p>
          </div>
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>
        <div className="filter-bar">
          <select value={selectedColonyId} onChange={(event) => setSelectedColonyId(event.target.value)}>
            <option value="">Select colony</option>
            {colonies.map((colony) => (
              <option key={colony.id} value={colony.id}>
                {colony.name || `Colony ${colony.id}`}
              </option>
            ))}
          </select>
          <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search flat no, address, status..." />
          <button type="button" className="ghost-button" onClick={() => setFilter("")}>
            Clear
          </button>
        </div>
        <p className="inline-message">Flat-wise rent rates are no longer edited here. Set rent from the committee assignment screen using worker basic pay.</p>
        <table>
          <thead>
            <tr>
              <th>Flat</th>
              <th>Worker</th>
              <th>CNIC</th>
              <th>Basic Pay</th>
              <th>Assignment Rent</th>
              <th>Start Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!selectedColonyId ? (
              <tr>
                <td colSpan={7}>Select a colony to load flats.</td>
              </tr>
            ) : null}
            {selectedColonyId && !colonyFlats.length ? (
              <tr>
                <td colSpan={7}>No flats found for selected colony.</td>
              </tr>
            ) : null}
            {selectedColonyId && colonyFlats.length && !activeAssignments.length ? (
              <tr>
                <td colSpan={7}>No active flat assignments found for selected colony.</td>
              </tr>
            ) : null}
            {activeAssignments.map((assignment) => {
              const flat = flats.find((item) => item.id === Number(assignment.flat_id));
              const worker = workers.find((item) => item.id === Number(assignment.worker_id));
              return (
                <tr key={assignment.id}>
                  <td>
                    <strong>{flat?.flat_no || `Flat #${assignment.flat_id}`}</strong>
                    <br />
                    <span>{flat?.flat_address || "Address not linked"}</span>
                  </td>
                  <td>{worker?.name || `Worker #${assignment.worker_id}`}</td>
                  <td>{worker?.cnic || "Not linked"}</td>
                  <td>{money(worker?.salary_per_month)}</td>
                  <td className={Number(assignment.rent_amount || 0) > 0 ? "text-green" : "text-red"}>{money(assignment.rent_amount)}</td>
                  <td>{assignment.start_date?.slice(0, 10) || "-"}</td>
                  <td>
                    <StatusPill status={assignment.status} />
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
