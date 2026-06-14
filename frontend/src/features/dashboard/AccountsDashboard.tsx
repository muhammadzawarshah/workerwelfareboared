"use client";

import { useState } from "react";
import type { Flat, GenericRecord, RentInvoice, UtilityBill, Worker } from "@/src/types";
import { money, statusLabel } from "@/src/lib/format";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { StatusPill } from "@/src/components/ui/StatusPill";
import { RefreshButton } from "@/src/components/ui/RefreshButton";

type ReportBasis = "monthly" | "quarterly" | "yearly";
type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

const QUARTER_MONTHS: Record<Quarter, number[]> = {
  Q1: [1, 2, 3], Q2: [4, 5, 6], Q3: [7, 8, 9], Q4: [10, 11, 12],
};

const now = new Date();
const DEFAULT_YEAR = String(now.getFullYear());
const DEFAULT_MONTH = String(now.getMonth() + 1).padStart(2, "0");
const DEFAULT_QUARTER: Quarter =
  now.getMonth() < 3 ? "Q1" : now.getMonth() < 6 ? "Q2" : now.getMonth() < 9 ? "Q3" : "Q4";

const MONTHS = [
  ["01", "January"], ["02", "February"], ["03", "March"], ["04", "April"],
  ["05", "May"], ["06", "June"], ["07", "July"], ["08", "August"],
  ["09", "September"], ["10", "October"], ["11", "November"], ["12", "December"],
];
const YEARS = Array.from({ length: 8 }, (_, i) => String(now.getFullYear() - 5 + i));

export function AccountsDashboard({
  rent,
  rentPayments,
  utilities,
  utilityPayments,
  workers,
  districts = [],
  colonies = [],
  flats = [],
  flatAssignments = [],
  onRefresh,
  isRefreshing,
}: {
  rent: RentInvoice[];
  rentPayments: GenericRecord[];
  utilities: UtilityBill[];
  utilityPayments: GenericRecord[];
  workers: Worker[];
  districts?: GenericRecord[];
  colonies?: GenericRecord[];
  flats?: Flat[];
  flatAssignments?: GenericRecord[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  // view: "district" → district list, "colony" → colonies in a district, "detail" → workers in a colony
  const [view, setView] = useState<"district" | "colony" | "detail">("district");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedColonyId, setSelectedColonyId] = useState<number | null>(null);
  const [reportBasis, setReportBasis] = useState<ReportBasis | null>(null);
  const [reportYear, setReportYear] = useState(DEFAULT_YEAR);
  const [reportMonth, setReportMonth] = useState(DEFAULT_MONTH);
  const [reportQuarter, setReportQuarter] = useState<Quarter>(DEFAULT_QUARTER);

  const workerName = (id?: number) =>
    workers.find((w) => w.id === Number(id))?.name || `Worker #${id ?? "—"}`;

  // ── Period filter ───────────────────────────────────────────────────────────
  function applyPeriod(invoices: RentInvoice[]): RentInvoice[] {
    if (!reportBasis) return invoices;
    return invoices.filter((inv) => {
      const bm = inv.billing_month?.slice(0, 7);
      if (!bm) return false;
      const [y, m] = bm.split("-").map(Number);
      if (reportBasis === "yearly") return y === Number(reportYear);
      if (reportBasis === "monthly") return y === Number(reportYear) && m === Number(reportMonth);
      if (reportBasis === "quarterly") return y === Number(reportYear) && QUARTER_MONTHS[reportQuarter].includes(m);
      return true;
    });
  }

  function periodLabel(): string {
    if (!reportBasis) return "All Time";
    if (reportBasis === "yearly") return reportYear;
    if (reportBasis === "quarterly") return `${reportQuarter} ${reportYear}`;
    return `${MONTHS.find(([v]) => v === reportMonth)?.[1] || reportMonth} ${reportYear}`;
  }

  const filteredRent = applyPeriod(rent);

  // ── Global metrics ──────────────────────────────────────────────────────────
  const rentTotal = filteredRent.reduce((s, r) => s + Number(r.total_amount || 0), 0);
  const rentPaid = filteredRent.reduce((s, r) => s + Number(r.paid_amount || 0), 0);
  const rentDue = Math.max(rentTotal - rentPaid, 0);
  const rentPaymentTotal = rentPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const utilityPaymentTotal = utilityPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const utilityDue = utilities
    .filter((b) => !["paid", "cancelled", "not_generated"].includes(b.status || ""))
    .reduce((s, b) => s + Number(b.total_amount || 0), 0);

  // ── Colony stats builder ────────────────────────────────────────────────────
  function buildColonyStats(colonyList: GenericRecord[]) {
    return colonyList.map((colony) => {
      const colonyFlats = flats.filter((f) => Number(f.colony_id) === colony.id);
      const flatIds = new Set(colonyFlats.map((f) => f.id));
      const assignments = flatAssignments.filter((a) => flatIds.has(Number(a.flat_id)));
      const workerIds = new Set(assignments.map((a) => Number(a.worker_id)));
      const colonyRent = filteredRent.filter((r) => workerIds.has(r.worker_id));
      const unpaid = colonyRent.filter((r) => !["paid", "cancelled"].includes(r.status));
      const totalDue = unpaid.reduce((s, r) => s + Math.max(Number(r.total_amount) - Number(r.paid_amount), 0), 0);
      const collected = colonyRent.reduce((s, r) => s + Number(r.paid_amount || 0), 0);
      return { colony, workerCount: workers.filter((w) => workerIds.has(w.id)).length, invoiceCount: colonyRent.length, unpaidCount: unpaid.length, totalDue, collected, workerIds };
    });
  }

  // ── District stats ──────────────────────────────────────────────────────────
  const districtStats = districts.map((district) => {
    const districtColonies = colonies.filter((c) => Number(c.district_id) === district.id);
    const stats = buildColonyStats(districtColonies);
    return {
      district,
      colonyCount: districtColonies.length,
      workerCount: stats.reduce((s, c) => s + c.workerCount, 0),
      invoiceCount: stats.reduce((s, c) => s + c.invoiceCount, 0),
      unpaidCount: stats.reduce((s, c) => s + c.unpaidCount, 0),
      totalDue: stats.reduce((s, c) => s + c.totalDue, 0),
      collected: stats.reduce((s, c) => s + c.collected, 0),
    };
  });

  // Colonies without a district (unassigned)
  const unassignedColonies = colonies.filter((c) => !c.district_id);

  // ── Period selector bar ─────────────────────────────────────────────────────
  const periodBar = (
    <section className="data-card">
      <div className="card-title" style={{ flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2>Report Period</h2>
          <p>{reportBasis ? `Filtered: ${periodLabel()}` : "Koi filter nahi — saara data dikh raha hai."}</p>
        </div>
        <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
      </div>
      <div className="report-period-bar">
        <div className="report-basis-toggle">
          {(["monthly", "quarterly", "yearly"] as ReportBasis[]).map((b) => (
            <button key={b} className={`report-basis-btn${reportBasis === b ? " active" : ""}`} onClick={() => setReportBasis(reportBasis === b ? null : b)}>
              {b === "monthly" ? "Monthly" : b === "quarterly" ? "Quarterly" : "Yearly"}
            </button>
          ))}
          {reportBasis && <button className="ghost-button compact" onClick={() => setReportBasis(null)}>✕ Clear</button>}
        </div>
        {reportBasis && (
          <div className="report-period-inputs">
            <label>
              <span>Year</span>
              <select value={reportYear} onChange={(e) => setReportYear(e.target.value)}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            {reportBasis === "monthly" && (
              <label>
                <span>Month</span>
                <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}>
                  {MONTHS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </label>
            )}
            {reportBasis === "quarterly" && (
              <label>
                <span>Quarter</span>
                <select value={reportQuarter} onChange={(e) => setReportQuarter(e.target.value as Quarter)}>
                  {(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((q) => (
                    <option key={q} value={q}>{q} ({q === "Q1" ? "Jan–Mar" : q === "Q2" ? "Apr–Jun" : q === "Q3" ? "Jul–Sep" : "Oct–Dec"})</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>
    </section>
  );

  // ── VIEW: Colony detail (workers + invoices) ────────────────────────────────
  if (view === "detail" && selectedColonyId !== null) {
    const selectedColony = colonies.find((c) => c.id === selectedColonyId);
    const colonyFlats = flats.filter((f) => Number(f.colony_id) === selectedColonyId);
    const flatIds = new Set(colonyFlats.map((f) => f.id));
    const assignments = flatAssignments.filter((a) => flatIds.has(Number(a.flat_id)));
    const workerIds = new Set(assignments.map((a) => Number(a.worker_id)));
    const detailRent = filteredRent.filter((r) => workerIds.has(r.worker_id));
    const detailInvoiceIds = new Set(detailRent.map((r) => r.id));
    const detailPayments = rentPayments.filter((p) => detailInvoiceIds.has(Number(p.rent_invoice_id)));
    const detailOutstanding = detailRent.filter((r) => !["paid", "cancelled"].includes(r.status));
    const detailCollected = detailPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const detailDue = detailOutstanding.reduce((s, r) => s + Math.max(Number(r.total_amount) - Number(r.paid_amount), 0), 0);
    const colonyWorkers = workers.filter((w) => workerIds.has(w.id));
    const colonyName = selectedColony?.name || `Colony #${selectedColonyId}`;

    return (
      <div className="screen-stack">
        <section className="metric-grid">
          <MetricCard title="Workers" value={colonyWorkers.length} hint={colonyName} />
          <MetricCard title="Invoices" value={detailRent.length} hint={periodLabel()} />
          <MetricCard title="Collected" value={money(detailCollected)} hint="Payments received" tone="green" />
          <MetricCard title="Outstanding" value={money(detailDue)} hint={`${detailOutstanding.length} unpaid`} tone="amber" />
        </section>

        {periodBar}

        <section className="data-card">
          <div className="card-title">
            <div>
              <h2>{colonyName} — {periodLabel()}</h2>
              <p>{colonyWorkers.length} workers · {detailRent.length} invoices · {detailPayments.length} payments</p>
            </div>
            <div className="card-actions">
              <button className="ghost-button" onClick={() => { setView(selectedDistrictId !== null ? "colony" : "district"); }}>
                ← Wapas {selectedDistrictId !== null ? "Colonies" : "Districts"}
              </button>
            </div>
          </div>
        </section>

        <section className="data-card">
          <div className="card-title"><div><h2>Rent Invoices</h2><p>{periodLabel()} · is colony ke workers.</p></div></div>
          <table>
            <thead><tr><th>Worker</th><th>Invoice #</th><th>Billing Month</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
            <tbody>
              {detailRent.length ? detailRent.map((inv) => (
                <tr key={inv.id}>
                  <td><strong>{workerName(inv.worker_id)}</strong></td>
                  <td>#{inv.id}</td>
                  <td>{inv.billing_month?.slice(0, 7) || "—"}</td>
                  <td>{money(inv.total_amount)}</td>
                  <td>{money(inv.paid_amount)}</td>
                  <td>{money(Math.max(Number(inv.total_amount) - Number(inv.paid_amount), 0))}</td>
                  <td><StatusPill status={inv.status} /></td>
                </tr>
              )) : <tr><td colSpan={7}>Is period mein koi invoice nahi.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="data-card">
          <div className="card-title"><div><h2>Rent Receipts</h2><p>Is colony ke workers se mili payments.</p></div></div>
          <table>
            <thead><tr><th>Receipt</th><th>Worker</th><th>Method</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {detailPayments.length ? detailPayments.map((p) => {
                const inv = detailRent.find((r) => r.id === Number(p.rent_invoice_id));
                return (
                  <tr key={p.id}>
                    <td><strong>{p.receipt_no || `#${p.id}`}</strong></td>
                    <td>{workerName(inv?.worker_id)}</td>
                    <td><span className="soft-tag">{statusLabel(p.payment_method || "manual")}</span></td>
                    <td>{money(p.amount)}</td>
                    <td>{p.payment_date?.slice(0, 10) || p.created_at?.slice(0, 10) || "—"}</td>
                  </tr>
                );
              }) : <tr><td colSpan={5}>Koi payment nahi mili.</td></tr>}
            </tbody>
          </table>
        </section>

        {detailOutstanding.length > 0 && (
          <section className="data-card">
            <div className="card-title"><div><h2>Outstanding Balances</h2><p>{detailOutstanding.length} unpaid invoices.</p></div></div>
            <table>
              <thead><tr><th>Worker</th><th>Invoice #</th><th>Billing Month</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {detailOutstanding.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong>{workerName(inv.worker_id)}</strong></td>
                    <td>#{inv.id}</td>
                    <td>{inv.billing_month?.slice(0, 7) || "—"}</td>
                    <td style={{ color: "#dc2626", fontWeight: 600 }}>{money(Math.max(Number(inv.total_amount) - Number(inv.paid_amount), 0))}</td>
                    <td><StatusPill status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    );
  }

  // ── VIEW: Colony list (inside a district or unassigned) ────────────────────
  if (view === "colony") {
    const selectedDistrict = selectedDistrictId !== null ? districts.find((d) => d.id === selectedDistrictId) : null;
    const districtColonies = selectedDistrictId !== null
      ? colonies.filter((c) => Number(c.district_id) === selectedDistrictId)
      : colonies.filter((c) => !c.district_id);
    const stats = buildColonyStats(districtColonies);
    const districtDue = stats.reduce((s, c) => s + c.totalDue, 0);
    const districtCollected = stats.reduce((s, c) => s + c.collected, 0);
    const districtName = selectedDistrict?.name || (selectedDistrictId === null ? "Unassigned Colonies" : `District #${selectedDistrictId}`);

    return (
      <div className="screen-stack">
        <section className="metric-grid">
          <MetricCard title="Colonies" value={districtColonies.length} hint={districtName} />
          <MetricCard title="Workers" value={stats.reduce((s, c) => s + c.workerCount, 0)} hint="Total in district" />
          <MetricCard title="Collected" value={money(districtCollected)} hint={periodLabel()} tone="green" />
          <MetricCard title="Outstanding" value={money(districtDue)} hint={`${stats.reduce((s, c) => s + c.unpaidCount, 0)} unpaid`} tone="amber" />
        </section>

        {periodBar}

        <section className="data-card">
          <div className="card-title">
            <div>
              <h2>{districtName} — Colonies ({periodLabel()})</h2>
              <p>Colony click karein to workers detail dekhein.</p>
            </div>
            <button className="ghost-button" onClick={() => { setSelectedDistrictId(null); setView("district"); }}>← Wapas Districts</button>
          </div>
          <table>
            <thead><tr><th>Colony</th><th>Workers</th><th>Invoices</th><th>Collected</th><th>Unpaid</th><th>Amount Due</th><th></th></tr></thead>
            <tbody>
              {stats.length ? stats.map(({ colony, workerCount, invoiceCount, unpaidCount, totalDue, collected }) => (
                <tr key={colony.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedColonyId(colony.id); setView("detail"); }}>
                  <td><strong>{colony.name || `Colony #${colony.id}`}</strong></td>
                  <td>{workerCount}</td>
                  <td>{invoiceCount}</td>
                  <td><span style={{ color: "#16a34a", fontWeight: 600 }}>{money(collected)}</span></td>
                  <td>{unpaidCount ? <span className="reupload-badge">{unpaidCount} unpaid</span> : <span className="muted-text">0</span>}</td>
                  <td>{totalDue > 0 ? <span style={{ color: "#dc2626", fontWeight: 600 }}>{money(totalDue)}</span> : <span className="muted-text">—</span>}</td>
                  <td><button className="ghost-button compact" onClick={(e) => { e.stopPropagation(); setSelectedColonyId(colony.id); setView("detail"); }}>Detail →</button></td>
                </tr>
              )) : <tr><td colSpan={7}>Is district mein koi colony nahi.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  // ── VIEW: District list (default) ──────────────────────────────────────────
  const colonyStats = buildColonyStats(colonies);
  const recentRentPayments = rentPayments.slice(0, 8);
  const recentUtilityPayments = utilityPayments.slice(0, 8);

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Rent Due" value={money(rentDue)} hint={`${filteredRent.filter((r) => !["paid", "cancelled"].includes(r.status)).length} invoices · ${periodLabel()}`} tone="amber" />
        <MetricCard title="Rent Collected" value={money(rentPaymentTotal || rentPaid)} hint={`Rent payments · ${periodLabel()}`} tone="green" />
        <MetricCard title="Utility Due" value={money(utilityDue)} hint={`${utilities.filter((b) => !["paid", "cancelled", "not_generated"].includes(b.status || "")).length} bills`} tone="red" />
        <MetricCard title="Utility Paid" value={money(utilityPaymentTotal)} hint="Utility payment ledger" tone="purple" />
      </section>

      {periodBar}

      {/* District-wise summary */}
      {districts.length > 0 && (
        <section className="data-card">
          <div className="card-title">
            <div><h2>Rent — District Wise ({periodLabel()})</h2><p>District click karein to colonies dekhein, phir colony se workers.</p></div>
          </div>
          <table>
            <thead><tr><th>District</th><th>Colonies</th><th>Workers</th><th>Collected</th><th>Unpaid</th><th>Amount Due</th><th></th></tr></thead>
            <tbody>
              {districtStats.map(({ district, colonyCount, workerCount, unpaidCount, totalDue, collected }) => (
                <tr key={district.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedDistrictId(district.id); setView("colony"); }}>
                  <td><strong>{district.name || `District #${district.id}`}</strong></td>
                  <td>{colonyCount}</td>
                  <td>{workerCount}</td>
                  <td><span style={{ color: "#16a34a", fontWeight: 600 }}>{money(collected)}</span></td>
                  <td>{unpaidCount ? <span className="reupload-badge">{unpaidCount} unpaid</span> : <span className="muted-text">0</span>}</td>
                  <td>{totalDue > 0 ? <span style={{ color: "#dc2626", fontWeight: 600 }}>{money(totalDue)}</span> : <span className="muted-text">—</span>}</td>
                  <td><button className="ghost-button compact" onClick={(e) => { e.stopPropagation(); setSelectedDistrictId(district.id); setView("colony"); }}>Colonies →</button></td>
                </tr>
              ))}
              {unassignedColonies.length > 0 && (
                <tr style={{ cursor: "pointer" }} onClick={() => { setSelectedDistrictId(null); setView("colony"); }}>
                  <td><span className="muted-text">Unassigned</span></td>
                  <td>{unassignedColonies.length}</td>
                  <td colSpan={4}><span className="muted-text">Colonies without district</span></td>
                  <td><button className="ghost-button compact">View →</button></td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Colony-wise summary (always shown) */}
      <section className="data-card">
        <div className="card-title">
          <div><h2>Rent — Colony Wise ({periodLabel()})</h2><p>Colony click karein to workers detail dekhein.</p></div>
        </div>
        <table>
          <thead><tr><th>Colony</th><th>District</th><th>Workers</th><th>Invoices</th><th>Collected</th><th>Unpaid</th><th>Amount Due</th><th></th></tr></thead>
          <tbody>
            {colonyStats.length ? colonyStats.map(({ colony, workerCount, invoiceCount, unpaidCount, totalDue, collected }) => {
              const district = districts.find((d) => d.id === Number(colony.district_id));
              return (
                <tr key={colony.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedColonyId(colony.id); setView("detail"); }}>
                  <td><strong>{colony.name || `Colony #${colony.id}`}</strong></td>
                  <td>{district ? <span className="soft-tag">{district.name}</span> : <span className="muted-text">—</span>}</td>
                  <td>{workerCount}</td>
                  <td>{invoiceCount}</td>
                  <td><span style={{ color: "#16a34a", fontWeight: 600 }}>{money(collected)}</span></td>
                  <td>{unpaidCount ? <span className="reupload-badge">{unpaidCount} unpaid</span> : <span className="muted-text">0</span>}</td>
                  <td>{totalDue > 0 ? <span style={{ color: "#dc2626", fontWeight: 600 }}>{money(totalDue)}</span> : <span className="muted-text">—</span>}</td>
                  <td><button className="ghost-button compact" onClick={(e) => { e.stopPropagation(); setSelectedColonyId(colony.id); setView("detail"); }}>Detail →</button></td>
                </tr>
              );
            }) : <tr><td colSpan={8}>Koi colony nahi mili.</td></tr>}
          </tbody>
        </table>
      </section>

      {/* Recent payments */}
      <section className="dashboard-grid wide">
        <div className="data-card">
          <div className="card-title"><div><h2>Rent Receipts</h2><p>Latest rent payments received.</p></div></div>
          <table>
            <thead><tr><th>Payment</th><th>Method</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {recentRentPayments.length ? recentRentPayments.map((p) => {
                const inv = rent.find((r) => r.id === Number(p.rent_invoice_id));
                return (
                  <tr key={p.id}>
                    <td><strong>{p.receipt_no || `Rent Payment #${p.id}`}</strong><br /><span>{workerName(inv?.worker_id)}</span></td>
                    <td><span className="soft-tag">{statusLabel(p.payment_method || "manual")}</span></td>
                    <td>{money(p.amount)}</td>
                    <td>{p.payment_date?.slice(0, 10) || p.created_at?.slice(0, 10) || "—"}</td>
                  </tr>
                );
              }) : <tr><td colSpan={4}>No rent payments found.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="data-card">
          <div className="card-title"><div><h2>Utility Payments</h2><p>Latest utility bill payments.</p></div></div>
          <table>
            <thead><tr><th>Payment</th><th>Bill</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {recentUtilityPayments.length ? recentUtilityPayments.map((p) => {
                const bill = utilities.find((b) => b.id === Number(p.utility_bill_id));
                return (
                  <tr key={p.id}>
                    <td><strong>{p.receipt_no || `Utility Payment #${p.id}`}</strong><br /><span>{statusLabel(p.payment_method || "manual")}</span></td>
                    <td>{bill?.bill_type || "Utility"}<br /><span>{bill?.consumer_number || `Bill #${p.utility_bill_id}`}</span></td>
                    <td>{money(p.amount)}</td>
                    <td>{p.payment_date?.slice(0, 10) || p.created_at?.slice(0, 10) || "—"}</td>
                  </tr>
                );
              }) : <tr><td colSpan={4}>No utility payments found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Outstanding */}
      <section className="data-card">
        <div className="card-title"><div><h2>Outstanding Accounts</h2><p>Rent and utility balances requiring follow-up.</p></div></div>
        <table>
          <thead><tr><th>Type</th><th>Account</th><th>Billing Month</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {filteredRent.filter((r) => !["paid", "cancelled"].includes(r.status)).slice(0, 10).map((inv) => (
              <tr key={`rent-${inv.id}`}>
                <td>Rent</td>
                <td><strong>{workerName(inv.worker_id)}</strong><br /><span>Invoice #{inv.id}</span></td>
                <td>{inv.billing_month?.slice(0, 7) || "—"}</td>
                <td>{money(Math.max(Number(inv.total_amount) - Number(inv.paid_amount), 0))}</td>
                <td><StatusPill status={inv.status} /></td>
              </tr>
            ))}
            {utilities.filter((b) => !["paid", "cancelled", "not_generated"].includes(b.status || "")).slice(0, 10).map((bill) => (
              <tr key={`utility-${bill.id}`}>
                <td>Utility</td>
                <td><strong>{bill.bill_type || "Utility Bill"}</strong><br /><span>{bill.consumer_number || `Bill #${bill.id}`}</span></td>
                <td>{bill.billing_month?.slice(0, 7) || "—"}</td>
                <td>{money(bill.total_amount)}</td>
                <td><StatusPill status={bill.status} /></td>
              </tr>
            ))}
            {!filteredRent.some((r) => !["paid", "cancelled"].includes(r.status)) &&
              !utilities.some((b) => !["paid", "cancelled", "not_generated"].includes(b.status || "")) && (
                <tr><td colSpan={5}>No outstanding account balances.</td></tr>
              )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
