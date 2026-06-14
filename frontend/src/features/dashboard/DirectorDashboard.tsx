"use client";

import type { DataProps, GenericRecord, User } from "@/src/types";
import type { NavKey } from "@/src/config/navigation";
import { money } from "@/src/lib/format";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { ActionCard } from "@/src/components/ui/ActionCard";
import { ChartCard, DonutCard } from "@/src/components/ui/Charts";
import { ApplicationTable } from "@/src/features/applications/ApplicationTable";

export function DirectorDashboard({
  workers,
  applications,
  flats,
  rent,
  complaints,
  dashboard,
  setActive,
  documents = [],
  notifications = [],
  flatAssignments = [],
  industries = [],
  colonies = [],
  users = [],
}: DataProps & {
  setActive: (k: NavKey) => void;
  documents?: GenericRecord[];
  notifications?: GenericRecord[];
  flatAssignments?: GenericRecord[];
  industries?: GenericRecord[];
  colonies?: GenericRecord[];
  users?: User[];
}) {
  const occupied = flats.filter((f) => f.status === "filled").length;
  const pendingApplications = applications.filter((a) => a.status.includes("pending") || a.status === "under_verification").length;
  const collected = rent.reduce((s, i) => s + Number(i.paid_amount), 0);
  const complaintOpen = complaints.filter((c) => c.status !== "resolved").length;
  const allotteesCount = dashboard?.workers ?? workers.length;
  const applicationsCount = dashboard?.applications ?? applications.length;
  const flatCount = dashboard?.flats ?? flats.length;
  const complaintCount = dashboard?.complaints ?? complaintOpen;
  const unpaidRentCount = dashboard?.rentUnpaid ?? rent.filter((i) => i.status !== "paid").length;
  const unpaidUtilityCount = dashboard?.utilityUnpaid ?? 0;

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Applications" value={applicationsCount} hint={`${pendingApplications} awaiting review`} />
        <MetricCard title="Allottees" value={allotteesCount} hint="Registered worker profiles" tone="green" />
        <MetricCard title="Total Units" value={flatCount} hint={`${occupied} occupied`} tone="purple" />
        <MetricCard title="Rent Issues" value={unpaidRentCount} hint={`${money(collected)} collected`} tone="amber" />
        <MetricCard title="Open Work" value={complaintCount + unpaidUtilityCount} hint={`${complaintCount} complaints, ${unpaidUtilityCount} utility bills`} tone="red" />
      </section>
      <section className="action-grid">
        <ActionCard title="Verify Applications" caption={`${pendingApplications} pending verification`} onClick={() => setActive("applications")} />
        <ActionCard title="Rent Collection" caption={`${unpaidRentCount} unpaid invoices`} onClick={() => setActive("rent")} />
        <ActionCard title="Complaints" caption={`${complaintCount} open cases`} onClick={() => setActive("complaints")} />
      </section>
      <div className="dashboard-grid">
        <ChartCard title="Monthly Overview" />
        <DonutCard title="Application Status" total={applicationsCount} items={[["Approved", 54], ["Pending", 25], ["Rejected", 8], ["Review", 13]]} />
      </div>
      <ApplicationTable
        applications={applications}
        workers={workers}
        documents={documents}
        notifications={notifications}
        flatAssignments={flatAssignments}
        industries={industries}
        flats={flats}
        colonies={colonies}
        users={users}
        role="director"
        onAddNew={() => setActive("newApplication")}
      />
    </div>
  );
}
