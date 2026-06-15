"use client";

import { useEffect, useMemo, useState } from "react";
import type { Application, CaretakerAttendance, CaretakerTask, Complaint, DashboardSummary, Flat, GenericRecord, GpsPing, RentInvoice, User, UtilityBill, Worker } from "@/src/types";
import { asArray, recordLabel } from "@/src/lib/format";
import { useResource } from "@/src/hooks/useResource";
import { defaultScreenForRole, isNavAllowed, navGroupsForRole, type NavKey } from "@/src/config/navigation";
import { ROLES, AD_COLONIES_ROLES, MANAGEMENT_ROLES } from "@/src/config/roles";

import { Sidebar } from "@/src/components/layout/Sidebar";
import { Topbar } from "@/src/components/layout/Topbar";
import { LoginPanel } from "@/src/components/auth/LoginPanel";

import { DirectorDashboard } from "@/src/features/dashboard/DirectorDashboard";
import { AccountsDashboard } from "@/src/features/dashboard/AccountsDashboard";
import { ApplicationTable } from "@/src/features/applications/ApplicationTable";
import { VerificationDesk } from "@/src/features/applications/VerificationDesk";
import { CommitteeDesk } from "@/src/features/applications/CommitteeDesk";
import { AllotmentDesk } from "@/src/features/applications/AllotmentDesk";
import { NewApplicationForm } from "@/src/features/applications/NewApplicationForm";
import { RentDashboard } from "@/src/features/rent/RentDashboard";
import { RentRatesDashboard } from "@/src/features/rent/RentRatesDashboard";
import { LateFeeRulesDashboard } from "@/src/features/rent/LateFeeRulesDashboard";
import { ComplaintDashboard } from "@/src/features/complaints/ComplaintDashboard";
import { CaretakerDutyDashboard } from "@/src/features/caretaker/CaretakerDutyDashboard";
import { CaretakerAdminDashboard } from "@/src/features/caretaker/CaretakerAdminDashboard";
import { CaretakerGpsDashboard } from "@/src/features/caretaker/CaretakerGpsDashboard";
import { DocumentsDashboard } from "@/src/features/documents/DocumentsDashboard";
import { DocumentTypesDashboard } from "@/src/features/documents/DocumentTypesDashboard";
import { IndustriesDashboard } from "@/src/features/industries/IndustriesDashboard";
import { UsersDashboard } from "@/src/features/users/UsersDashboard";
import { AssetsAdminDashboard } from "@/src/features/assets/AssetsAdminDashboard";
import { AssetsDashboard } from "@/src/features/assets/AssetsDashboard";
import { UnitsDashboard } from "@/src/features/assets/UnitsDashboard";
import { EvictionsDashboard } from "@/src/features/evictions/EvictionsDashboard";
import { GenericManagementScreen } from "@/src/features/generic/GenericManagementScreen";
import { SettingsScreen } from "@/src/features/settings/SettingsScreen";

export function App() {
  const [active, setActive] = useState<NavKey>("director");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  // Hydrate auth from localStorage after mount (not available during SSR).
  /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from browser storage */
  useEffect(() => {
    setToken(localStorage.getItem("wwb_token") || "");
    const storedUser = localStorage.getItem("wwb_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setActive(defaultScreenForRole(parsedUser.role));
      } catch {
        localStorage.removeItem("wwb_user");
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const workers = useResource<Worker[]>("/workers", token, []);
  const applications = useResource<Application[]>("/worker-applications", token, []);
  const flats = useResource<Flat[]>("/residential-units", token, []);
  const flatAssignments = useResource<GenericRecord[]>("/flat-assignments", token, []);
  const industries = useResource<GenericRecord[]>("/industries", token, []);
  const districts = useResource<GenericRecord[]>("/districts", token, []);
  const colonies = useResource<GenericRecord[]>("/colonies", token, []);
  const documents = useResource<GenericRecord[]>("/documents", token, []);
  const documentTypes = useResource<GenericRecord[]>("/document-types", token, []);
  const rent = useResource<RentInvoice[]>("/rent-invoices", token, []);
  const rentRates = useResource<GenericRecord[]>("/rent-rates", token, []);
  const lateFeeRules = useResource<GenericRecord[]>("/late-fee-rules", token, []);
  const rentPayments = useResource<GenericRecord[]>("/rent-payments", token, []);
  const complaints = useResource<Complaint[]>("/complaints", token, []);
  const complaintBudgets = useResource<GenericRecord[]>("/complaint-budgets", token, []);
  const utilities = useResource<UtilityBill[]>("/utility-bills", token, []);
  const utilityConnections = useResource<GenericRecord[]>("/utility-connections", token, []);
  const utilityPayments = useResource<GenericRecord[]>("/utility-payments", token, []);
  const assets = useResource<GenericRecord[]>("/assets", token, []);
  const tasks = useResource<CaretakerTask[]>("/caretaker/tasks", token, []);
  const attendance = useResource<CaretakerAttendance[]>("/caretaker/attendance", token, []);
  const gps = useResource<GpsPing[]>("/caretaker/gps", token, []);
  const taskProofs = useResource<GenericRecord[]>("/task-proofs", token, []);
  const evictionCases = useResource<GenericRecord[]>("/eviction-cases", token, []);
  const evictionHearings = useResource<GenericRecord[]>("/eviction-hearings", token, []);
  const users = useResource<User[]>("/users", token, []);
  const notifications = useResource<GenericRecord[]>("/notifications", token, []);
  const auditLogs = useResource<GenericRecord[]>("/audit-logs", token, []);
  const dashboardName = user?.role === ROLES.careTakerLabourColony ? "caretaker" : "director";
  const dashboard = useResource<DashboardSummary>(`/dashboard/${dashboardName}`, token, {
    workers: 0,
    applications: 0,
    flats: 0,
    complaints: 0,
    rentUnpaid: 0,
    utilityUnpaid: 0,
    tasks: 0,
  });

  const online =
    dashboard.online ||
    workers.online ||
    applications.online ||
    flats.online ||
    flatAssignments.online ||
    industries.online ||
    districts.online ||
    colonies.online ||
    documents.online ||
    documentTypes.online ||
    rent.online ||
    rentRates.online ||
    lateFeeRules.online ||
    rentPayments.online ||
    complaints.online ||
    complaintBudgets.online ||
    utilities.online ||
    utilityConnections.online ||
    utilityPayments.online ||
    assets.online ||
    tasks.online ||
    attendance.online ||
    gps.online ||
    taskProofs.online ||
    evictionCases.online ||
    evictionHearings.online ||
    users.online ||
    notifications.online ||
    auditLogs.online;

  const visibleNavGroups = useMemo(() => navGroupsForRole(user?.role), [user?.role]);

  const activeTitle = useMemo(() => {
    const found = visibleNavGroups.flatMap((group) => group.items).find((item) => item.key === active);
    return found?.label || "Dashboard";
  }, [active, visibleNavGroups]);

  // Redirect to a permitted screen if the active tab is not allowed for the role
  // (render-phase adjustment instead of an effect).
  if (user && !isNavAllowed(user.role, active)) {
    setActive(defaultScreenForRole(user.role));
  }

  const navBadges = useMemo<Partial<Record<NavKey, number>>>(() => {
    if (user?.role === ROLES.industryAdmin) {
      return {
        applications: asArray<Application>(applications.data).length,
        allottees: asArray<Worker>(workers.data).length,
        notifications: asArray<GenericRecord>(notifications.data).length,
      };
    }
    if (user?.role === ROLES.worksWing) {
      return {
        assetsSetup: asArray<GenericRecord>(assets.data).length,
        colonies: asArray<GenericRecord>(colonies.data).length,
        units: asArray<Flat>(flats.data).length,
        assets: asArray<GenericRecord>(assets.data).length,
        notifications: asArray<GenericRecord>(notifications.data).length,
      };
    }
    if (user?.role === ROLES.careTakerLabourColony) {
      return {
        maintenance: asArray<CaretakerTask>(tasks.data).length,
        complaints: asArray<Complaint>(complaints.data).filter((item) => !["resolved", "closed"].includes(item.status)).length,
        caretakerGps: asArray<GpsPing>(gps.data).length,
        taskProofs: asArray<GenericRecord>(taskProofs.data).length,
        notifications: asArray<GenericRecord>(notifications.data).length,
      };
    }
    if (user?.role === ROLES.legalSection) {
      return {
        evictions: asArray<GenericRecord>(evictionCases.data).filter((item) => !["vacated", "closed"].includes(item.status || "")).length,
        notifications: asArray<GenericRecord>(notifications.data).length,
      };
    }
    if (user?.role === ROLES.financeWing) {
      return {
        accounts:
          asArray<RentInvoice>(rent.data).filter((item) => !["paid", "cancelled"].includes(item.status)).length +
          asArray<UtilityBill>(utilities.data).filter((item) => !["paid", "cancelled", "not_generated"].includes(item.status || "")).length,
        rent: dashboard.data.rentUnpaid,
        rentPayments: asArray<GenericRecord>(rentPayments.data).length,
        utilities: dashboard.data.utilityUnpaid,
        utilityPayments: asArray<GenericRecord>(utilityPayments.data).length,
        lateFeeRules: asArray<GenericRecord>(lateFeeRules.data).length,
        notifications: asArray<GenericRecord>(notifications.data).length,
      };
    }
    return {
      applications: dashboard.data.applications,
      allottees: dashboard.data.workers,
      units: dashboard.data.flats,
      flatAssignments: asArray<GenericRecord>(flatAssignments.data).length,
      evictions: asArray<GenericRecord>(evictionCases.data).filter((item) => !["vacated", "closed"].includes(item.status || "")).length,
      industries: asArray<GenericRecord>(industries.data).length,
      colonies: asArray<GenericRecord>(colonies.data).length,
      documents: asArray<GenericRecord>(documents.data).length,
      rent: dashboard.data.rentUnpaid,
      utilities: dashboard.data.utilityUnpaid,
      complaints: dashboard.data.complaints,
      maintenance: dashboard.data.tasks,
      caretakerDuty: dashboard.data.tasks,
      staff: asArray<User>(users.data).length,
      notifications: asArray<GenericRecord>(notifications.data).length,
    };
  }, [
    user?.role,
    applications.data,
    workers.data,
    dashboard.data,
    flatAssignments.data,
    industries.data,
    colonies.data,
    documents.data,
    users.data,
    notifications.data,
    assets.data,
    flats.data,
    tasks.data,
    complaints.data,
    gps.data,
    taskProofs.data,
    evictionCases.data,
    rent.data,
    utilities.data,
    rentPayments.data,
    utilityPayments.data,
    lateFeeRules.data,
  ]);

  function renderScreen() {
    const allColonies = asArray<GenericRecord>(colonies.data);
    const allFlats = asArray<Flat>(flats.data);
    const allWorkers = asArray<Worker>(workers.data);
    const allRent = asArray<RentInvoice>(rent.data);
    const allFlatAssignments = asArray<GenericRecord>(flatAssignments.data);

    // Colony-scoped filtering for caretaker role.
    const caretakerColonyId = user?.role === ROLES.careTakerLabourColony ? (user.colony_id ?? null) : null;
    const scopedFlats = caretakerColonyId
      ? allFlats.filter((f) => Number(f.colony_id) === caretakerColonyId)
      : allFlats;
    const scopedFlatIds = new Set(scopedFlats.map((f) => f.id));
    const scopedAssignments = caretakerColonyId
      ? allFlatAssignments.filter((a) => scopedFlatIds.has(Number(a.flat_id)))
      : allFlatAssignments;
    const scopedWorkerIds = new Set(scopedAssignments.map((a) => Number(a.worker_id)));
    const scopedWorkers = caretakerColonyId
      ? allWorkers.filter((w) => scopedWorkerIds.has(w.id))
      : allWorkers;
    const scopedRent = caretakerColonyId
      ? allRent.filter((r) => scopedWorkerIds.has(r.worker_id))
      : allRent;
    const assignedColony = caretakerColonyId
      ? allColonies.find((c) => c.id === caretakerColonyId)
      : null;

    const data = {
      workers: scopedWorkers,
      applications: asArray<Application>(applications.data),
      flats: scopedFlats,
      rent: scopedRent,
      complaints: asArray<Complaint>(complaints.data),
      dashboard: dashboard.data,
    };
    if (user && !isNavAllowed(user.role, active)) return <SettingsScreen />;
    if (active === "director")
      return (
        <DirectorDashboard
          workers={data.workers}
          applications={data.applications}
          flats={data.flats}
          rent={data.rent}
          complaints={data.complaints}
          dashboard={data.dashboard}
          setActive={setActive}
          documents={asArray<GenericRecord>(documents.data)}
          notifications={asArray<GenericRecord>(notifications.data)}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          industries={asArray<GenericRecord>(industries.data)}
          colonies={asArray<GenericRecord>(colonies.data)}
          users={asArray<User>(users.data)}
        />
      );
    if (active === "verificationDesk") {
      return (
        <VerificationDesk
          token={token}
          applications={data.applications}
          workers={data.workers}
          documents={asArray<GenericRecord>(documents.data)}
          documentTypes={asArray<GenericRecord>(documentTypes.data)}
          notifications={asArray<GenericRecord>(notifications.data)}
          onRefresh={() => {
            applications.refresh();
            documents.refresh();
            notifications.refresh();
          }}
          isRefreshing={applications.loading || documents.loading || notifications.loading}
        />
      );
    }
    if (active === "committeeDesk") {
      return (
        <CommitteeDesk
          token={token}
          applications={data.applications}
          workers={data.workers}
          onRefresh={() => {
            applications.refresh();
          }}
          isRefreshing={applications.loading}
        />
      );
    }
    if (active === "flatAssignments" && (AD_COLONIES_ROLES.includes(user?.role || "") || user?.role === ROLES.colonySection || MANAGEMENT_ROLES.includes(user?.role || ""))) {
      return (
        <AllotmentDesk
          token={token}
          applications={data.applications}
          workers={data.workers}
          flats={data.flats}
          colonies={asArray<GenericRecord>(colonies.data)}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          documentTypes={asArray<GenericRecord>(documentTypes.data)}
          onRefresh={() => {
            applications.refresh();
            flats.refresh();
            colonies.refresh();
            flatAssignments.refresh();
          }}
          isRefreshing={applications.loading || flats.loading || colonies.loading || flatAssignments.loading}
        />
      );
    }
    if (active === "applications")
      return (
        <ApplicationTable
          applications={data.applications}
          workers={data.workers}
          documents={asArray<GenericRecord>(documents.data)}
          notifications={asArray<GenericRecord>(notifications.data)}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          industries={asArray<GenericRecord>(industries.data)}
          flats={data.flats}
          colonies={asArray<GenericRecord>(colonies.data)}
          users={asArray<User>(users.data)}
          onAddNew={() => setActive("newApplication")}
          token={token}
          role={user?.role}
          onRefresh={() => {
            applications.refresh();
            documents.refresh();
            notifications.refresh();
            flatAssignments.refresh();
            industries.refresh();
            flats.refresh();
            colonies.refresh();
            users.refresh();
          }}
          isRefreshing={applications.loading || documents.loading || notifications.loading || flatAssignments.loading || industries.loading || flats.loading || colonies.loading || users.loading}
        />
      );
    if (active === "newApplication") {
      if (user?.role !== ROLES.industryAdmin) return <SettingsScreen />;
      return <NewApplicationForm token={token} documentTypes={asArray<GenericRecord>(documentTypes.data)} onSuccess={() => setActive("applications")} />;
    }
    if (active === "industries") return <IndustriesDashboard token={token} industries={asArray<GenericRecord>(industries.data)} users={asArray<User>(users.data)} onRefresh={industries.refresh} isRefreshing={industries.loading} />;
    if (active === "accounts")
      return (
        <AccountsDashboard
          token={token}
          rent={data.rent}
          rentPayments={asArray<GenericRecord>(rentPayments.data)}
          documents={asArray<GenericRecord>(documents.data)}
          utilities={asArray<UtilityBill>(utilities.data)}
          utilityPayments={asArray<GenericRecord>(utilityPayments.data)}
          workers={data.workers}
          users={asArray<User>(users.data)}
          districts={asArray<GenericRecord>(districts.data)}
          colonies={asArray<GenericRecord>(colonies.data)}
          flats={asArray<Flat>(flats.data)}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          onRefresh={() => {
            rent.refresh();
            rentPayments.refresh();
            utilities.refresh();
            utilityPayments.refresh();
            workers.refresh();
            districts.refresh();
            colonies.refresh();
            flats.refresh();
            flatAssignments.refresh();
          }}
          isRefreshing={rent.loading || rentPayments.loading || utilities.loading || utilityPayments.loading || workers.loading}
        />
      );
    if (active === "rent")
      return (
        <RentDashboard
          rent={data.rent}
          workers={data.workers}
          lateFeeRules={asArray<GenericRecord>(lateFeeRules.data)}
          documentTypes={asArray<GenericRecord>(documentTypes.data)}
          token={token}
          role={user?.role}
          onRefresh={() => {
            rent.refresh();
            lateFeeRules.refresh();
            documentTypes.refresh();
          }}
          isRefreshing={rent.loading || lateFeeRules.loading || documentTypes.loading}
        />
      );
    if (active === "rentRates")
      return (
        <RentRatesDashboard
          colonies={asArray<GenericRecord>(colonies.data)}
          flats={data.flats}
          workers={data.workers}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          onRefresh={() => {
            colonies.refresh();
            flats.refresh();
            workers.refresh();
            flatAssignments.refresh();
          }}
          isRefreshing={colonies.loading || flats.loading || workers.loading || flatAssignments.loading}
        />
      );
    if (active === "lateFeeRules")
      return (
        <LateFeeRulesDashboard
          token={token}
          lateFeeRules={asArray<GenericRecord>(lateFeeRules.data)}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          flats={data.flats}
          workers={data.workers}
          onRefresh={() => {
            lateFeeRules.refresh();
            flatAssignments.refresh();
            flats.refresh();
            workers.refresh();
          }}
          isRefreshing={lateFeeRules.loading || flatAssignments.loading || flats.loading || workers.loading}
        />
      );
    if (active === "evictions")
      return (
        <EvictionsDashboard
          token={token}
          cases={asArray<GenericRecord>(evictionCases.data)}
          hearings={asArray<GenericRecord>(evictionHearings.data)}
          workers={data.workers}
          flats={data.flats}
          colonies={asArray<GenericRecord>(colonies.data)}
          flatAssignments={asArray<GenericRecord>(flatAssignments.data)}
          documentTypes={asArray<GenericRecord>(documentTypes.data)}
          onRefresh={() => {
            evictionCases.refresh();
            evictionHearings.refresh();
            workers.refresh();
            flats.refresh();
            colonies.refresh();
            flatAssignments.refresh();
            documentTypes.refresh();
          }}
          isRefreshing={evictionCases.loading || evictionHearings.loading || workers.loading || flats.loading || colonies.loading || documentTypes.loading}
        />
      );
    if (active === "complaints") return <ComplaintDashboard complaints={data.complaints} workers={data.workers} token={token} role={user?.role} colonies={allColonies} users={asArray<User>(users.data)} documentTypes={asArray<GenericRecord>(documentTypes.data)} onRefresh={complaints.refresh} isRefreshing={complaints.loading} />;
    if (active === "caretakerGps") return <CaretakerGpsDashboard gps={asArray<GpsPing>(gps.data)} users={asArray<User>(users.data)} onRefresh={gps.refresh} isRefreshing={gps.loading} />;
    if (active === "assetsSetup")
      return (
        <AssetsAdminDashboard
          token={token}
          colonies={asArray<GenericRecord>(colonies.data)}
          flats={data.flats}
          assets={asArray<GenericRecord>(assets.data)}
          onRefresh={() => {
            colonies.refresh();
            flats.refresh();
            assets.refresh();
          }}
          isRefreshing={colonies.loading || flats.loading || assets.loading}
        />
      );
    if (active === "assets")
      return (
        <AssetsDashboard
          token={token}
          assets={asArray<GenericRecord>(assets.data)}
          colonies={asArray<GenericRecord>(colonies.data)}
          onRefresh={() => { assets.refresh(); colonies.refresh(); }}
          isRefreshing={assets.loading || colonies.loading}
        />
      );
    if (active === "units") {
      return (
        <UnitsDashboard
          token={token}
          flats={data.flats}
          colonies={asArray<GenericRecord>(colonies.data)}
          role={user?.role}
          onRefresh={() => {
            flats.refresh();
            colonies.refresh();
          }}
          isRefreshing={flats.loading || colonies.loading}
        />
      );
    }
    if (active === "maintenance" && user?.role === ROLES.careTakerLabourColony) {
      return (
        <CaretakerAdminDashboard
          token={token}
          complaints={data.complaints}
          tasks={asArray<CaretakerTask>(tasks.data)}
          users={asArray<User>(users.data)}
          assets={asArray<GenericRecord>(assets.data)}
          flats={data.flats}
          colonies={asArray<GenericRecord>(colonies.data)}
          gps={asArray<GpsPing>(gps.data)}
          taskProofs={asArray<GenericRecord>(taskProofs.data)}
          onRefresh={() => {
            complaints.refresh();
            tasks.refresh();
            users.refresh();
            assets.refresh();
            flats.refresh();
            colonies.refresh();
            gps.refresh();
            taskProofs.refresh();
          }}
          isRefreshing={complaints.loading || tasks.loading || users.loading || assets.loading || flats.loading || colonies.loading || gps.loading || taskProofs.loading}
        />
      );
    }
    if (active === "caretakerDuty") {
      if (!user) return <SettingsScreen />;
      return (
        <CaretakerDutyDashboard
          token={token}
          user={user}
          assignedColonyName={assignedColony?.name}
          attendance={asArray<CaretakerAttendance>(attendance.data)}
          gps={asArray<GpsPing>(gps.data)}
          onRefresh={() => {
            gps.refresh();
          }}
        />
      );
    }
    if (active === "documents") {
      return <DocumentsDashboard token={token} documents={asArray<GenericRecord>(documents.data)} documentTypes={asArray<GenericRecord>(documentTypes.data)} onRefresh={documents.refresh} isRefreshing={documents.loading} />;
    }
    if (active === "documentTypes") {
      return <DocumentTypesDashboard token={token} documentTypes={asArray<GenericRecord>(documentTypes.data)} onRefresh={documentTypes.refresh} isRefreshing={documentTypes.loading} />;
    }
    if (active === "staff") return <UsersDashboard token={token} users={asArray<User>(users.data)} colonies={allColonies} onRefresh={() => { users.refresh(); colonies.refresh(); }} isRefreshing={users.loading || colonies.loading} />;
    if (active === "settings") return <SettingsScreen />;

    const rows: Record<NavKey, string[]> = {
      director: [],
      applications: [],
      newApplication: [],
      verificationDesk: [],
      committeeDesk: [],
      allottees: data.workers.map((item) => item.name),
      industries: asArray<GenericRecord>(industries.data).map((item) => recordLabel(item, `Industry ${item.id}`)),
      colonies: asArray<GenericRecord>(colonies.data).map((item) => recordLabel(item, `Colony ${item.id}`)),
      flatAssignments: asArray<GenericRecord>(flatAssignments.data).map((item) => recordLabel(item, `Assignment ${item.id}`)),
      evictions: asArray<GenericRecord>(evictionCases.data).map((item) => item.occupant_name || item.case_no || `Eviction Case ${item.id}`),
      documents: asArray<GenericRecord>(documents.data).map((item) => recordLabel(item, `Document ${item.id}`)),
      documentTypes: asArray<GenericRecord>(documentTypes.data).map((item) => recordLabel(item, `Document Type ${item.id}`)),
      units: data.flats.map((item) => `${item.flat_no} — ${item.flat_address}`),
      accounts: [],
      rent: [],
      rentRates: asArray<GenericRecord>(rentRates.data).map((item) => recordLabel(item, `Rent Rate ${item.id}`)),
      lateFeeRules: asArray<GenericRecord>(lateFeeRules.data).map((item) => recordLabel(item, `Late Fee Rule ${item.id}`)),
      rentPayments: asArray<GenericRecord>(rentPayments.data).map((item) => recordLabel(item, `Rent Payment ${item.id}`)),
      utilities: asArray<UtilityBill>(utilities.data).map((item) => `${item.bill_type || "Utility"} - ${item.consumer_number || `Bill ${item.id}`}`),
      utilityConnections: asArray<GenericRecord>(utilityConnections.data).map((item) => recordLabel(item, `Utility Connection ${item.id}`)),
      utilityPayments: asArray<GenericRecord>(utilityPayments.data).map((item) => recordLabel(item, `Utility Payment ${item.id}`)),
      complaints: [],
      complaintBudgets: asArray<GenericRecord>(complaintBudgets.data).map((item) => recordLabel(item, `Complaint Budget ${item.id}`)),
      maintenance: asArray<CaretakerTask>(tasks.data).map((item) => item.title || item.description || `Task ${item.id}`),
      assets: asArray<GenericRecord>(assets.data).map((item) => recordLabel(item, `Asset ${item.id}`)),
      assetsSetup: [],
      caretakerDuty: [],
      caretakerAttendance: asArray<CaretakerAttendance>(attendance.data).map((item) => `Attendance ${item.id} - ${item.status || "active"}`),
      caretakerGps: asArray<GpsPing>(gps.data).map((item) => `GPS ${item.id} - ${item.latitude}, ${item.longitude}`),
      taskProofs: asArray<GenericRecord>(taskProofs.data).map((item) => recordLabel(item, `Task Proof ${item.id}`)),
      staff: asArray<User>(users.data).map((item) => `${item.name} - ${item.role}`),
      notifications: asArray<GenericRecord>(notifications.data).map((item) => {
        const n = item as Record<string, unknown>;
        const title = String(n.title || `Notification ${item.id}`);
        const msg = n.message ? ` — ${String(n.message)}` : "";
        const stamp = n.sent_at || n.created_at;
        const when = stamp ? ` (${String(stamp).slice(0, 10)})` : "";
        return `${title}${msg}${when}`;
      }),
      auditLogs: asArray<GenericRecord>(auditLogs.data).map((item) => recordLabel(item, `Audit Log ${item.id}`)),
      reports: [
        `Workers Report - ${dashboard.data.workers} records`,
        `Applications Report - ${dashboard.data.applications} records`,
        `Rent Report - ${dashboard.data.rentUnpaid} unpaid invoices`,
        `Utilities Report - ${dashboard.data.utilityUnpaid} unpaid bills`,
        `Complaints Report - ${dashboard.data.complaints} records`,
      ],
      settings: [],
    };
    const refreshByScreen: Partial<Record<NavKey, { refresh: () => void; loading: boolean }>> = {
      allottees: workers,
      colonies,
      units: flats,
      flatAssignments,
      evictions: evictionCases,
      documentTypes,
      rentRates,
      lateFeeRules,
      rentPayments,
      utilities,
      utilityConnections,
      utilityPayments,
      complaintBudgets,
      maintenance: tasks,
      assets,
      caretakerAttendance: attendance,
      caretakerGps: gps,
      taskProofs,
      notifications,
      auditLogs,
    };
    const activeRefresh = refreshByScreen[active];
    return <GenericManagementScreen title={activeTitle} subtitle="Operational dashboard" rows={rows[active] || []} token={token} onRefresh={activeRefresh?.refresh} isRefreshing={activeRefresh?.loading} />;
  }

  function logout() {
    localStorage.removeItem("wwb_token");
    localStorage.removeItem("wwb_user");
    setToken("");
    setUser(null);
    setActive("director");
  }

  if (!user) {
    return (
      <LoginPanel
        onLogin={(nextToken, nextUser) => {
          setToken(nextToken);
          setUser(nextUser);
          setActive(defaultScreenForRole(nextUser.role));
        }}
      />
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Sidebar
        active={active}
        setActive={setActive}
        onLogout={logout}
        badges={navBadges}
        role={user.role}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />
      <section className="min-w-0">
        <Topbar active={activeTitle} user={user} online={online} onMenu={() => setNavOpen(true)} />
        {/* Uniform gutters for every screen so all cards align consistently */}
        <div className="px-4 pt-5 pb-10 lg:px-9 lg:pt-7 lg:pb-12">{renderScreen()}</div>
      </section>
    </div>
  );
}
