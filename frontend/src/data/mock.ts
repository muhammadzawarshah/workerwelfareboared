import type {
  Application,
  Complaint,
  DashboardSummary,
  Flat,
  RentInvoice,
  User,
  UtilityBill,
  Worker,
  CaretakerTask,
} from "@/src/types";

// Demo data used as a fallback when the backend is unreachable ("Mock Data" mode).

export const mockWorkers: Worker[] = [
  { id: 1, name: "Muhammad Asif Khan", father_name: "Khan", cnic: "42101-1234567-1", designation: "Grade-16 Officer", worker_type: "industry", status: "active" },
  { id: 2, name: "Nadia Perveen", father_name: "Perveen", cnic: "42101-5555555-3", designation: "Grade-17 Officer", worker_type: "welfare_board", status: "pending" },
  { id: 3, name: "Tariq Zaman", father_name: "Zaman", cnic: "42101-7766554-4", designation: "Grade-19 Officer", worker_type: "industry", status: "active" },
  { id: 4, name: "Shahid Mehmood", father_name: "Mehmood", cnic: "42101-9876543-2", designation: "Grade-18 Officer", worker_type: "industry", status: "rejected" },
  { id: 5, name: "Rukhsana Bibi", father_name: "Bibi", cnic: "42101-3344556-9", designation: "Grade-16 Officer", worker_type: "industry", status: "active" },
];

export const mockApplications: Application[] = [
  { id: 1, application_no: "APP-2601", application_type: "new_allotment", status: "pending", worker_id: 1, requested_unit_type: "Type-A (3 Bed)", created_at: "2026-01-12" },
  { id: 2, application_no: "APP-2602", application_type: "reapply", status: "under_verification", worker_id: 4, requested_unit_type: "Type-B (2 Bed)", created_at: "2026-01-10" },
  { id: 3, application_no: "APP-2603", application_type: "transfer", status: "approved", worker_id: 2, requested_unit_type: "Type-C (1 Bed)", created_at: "2026-01-08" },
  { id: 4, application_no: "APP-2604", application_type: "new_allotment", status: "rejected", worker_id: 3, requested_unit_type: "Type-A (3 Bed)", created_at: "2026-01-01" },
  { id: 5, application_no: "APP-2605", application_type: "flat_change", status: "pending", worker_id: 5, requested_unit_type: "Type-B (2 Bed)", created_at: "2026-01-15" },
];

export const mockFlats: Flat[] = [
  { id: 1, flat_no: "A-07", flat_address: "Quaid Labour Colony", flat_rooms: 2, status: "filled" },
  { id: 2, flat_no: "B-22", flat_address: "Iqbal Labour Colony", flat_rooms: 3, status: "filled" },
  { id: 3, flat_no: "C-14", flat_address: "Iqbal Labour Colony", flat_rooms: 2, status: "empty" },
  { id: 4, flat_no: "D-03", flat_address: "Hayatabad Colony", flat_rooms: 1, status: "reserved" },
  { id: 5, flat_no: "E-08", flat_address: "Industrial Estate", flat_rooms: 2, status: "under_repair" },
];

export const mockRent: RentInvoice[] = [
  { id: 1, worker_id: 1, billing_month: "2026-01-01", rent_amount: 1200, paid_amount: 1200, total_amount: 1200, status: "paid" },
  { id: 2, worker_id: 2, billing_month: "2026-01-01", rent_amount: 950, paid_amount: 0, total_amount: 2850, status: "unpaid" },
  { id: 3, worker_id: 3, billing_month: "2026-01-01", rent_amount: 1100, paid_amount: 500, total_amount: 1100, status: "partial" },
  { id: 4, worker_id: 4, billing_month: "2026-01-01", rent_amount: 1400, paid_amount: 1400, total_amount: 1400, status: "paid" },
  { id: 5, worker_id: 5, billing_month: "2026-01-01", rent_amount: 1050, paid_amount: 1050, total_amount: 1050, status: "paid" },
];

export const mockComplaints: Complaint[] = [
  { id: 1, complaint_desc: "Main power line tripped near block B", status: "in_progress", worker_id: 1, created_at: "2026-05-15" },
  { id: 2, complaint_desc: "Water supply disrupted for 3 days", status: "pending", worker_id: 2, created_at: "2026-05-14" },
  { id: 3, complaint_desc: "Roof leakage causing interior damage", status: "pending", worker_id: 3, created_at: "2026-05-13" },
  { id: 4, complaint_desc: "Stray safety issue in colony courtyard", status: "resolved", worker_id: 5, created_at: "2026-05-10" },
];

export const mockUtilities: UtilityBill[] = [
  { id: 1, bill_type: "Electricity", consumer_number: "E-330188", billing_month: "2026-01-01", total_amount: 4350, status: "unpaid" },
  { id: 2, bill_type: "Gas", consumer_number: "G-90821", billing_month: "2026-01-01", total_amount: 1260, status: "paid" },
  { id: 3, bill_type: "Internet", consumer_number: "N-558812", billing_month: "2026-01-01", total_amount: 1800, status: "partial" },
];

export const mockTasks: CaretakerTask[] = [
  { id: 1, title: "Transformer Repair", status: "in_progress" },
  { id: 2, title: "Tube Well Service", status: "pending" },
  { id: 3, title: "Street Light Fix", status: "completed" },
];

export const mockUsers: User[] = [
  { id: 1, name: "Super Admin", email: "admin@example.com", role: "super_admin" },
  { id: 2, name: "Ahmad Raza", email: "caretaker@example.com", role: "care_taker_labour_colony" },
  { id: 3, name: "Finance Wing", email: "finance@example.com", role: "finance_wing" },
];

export const mockDashboard: DashboardSummary = {
  workers: mockWorkers.length,
  applications: mockApplications.length,
  flats: mockFlats.length,
  complaints: mockComplaints.length,
  rentUnpaid: mockRent.filter((invoice) => invoice.status !== "paid").length,
  utilityUnpaid: mockUtilities.filter((bill) => bill.status !== "paid").length,
  tasks: mockTasks.length,
};
