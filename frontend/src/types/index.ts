// Shared domain types for the Workers Welfare Board portal.

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: { total?: number };
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_photo?: string | null;
  colony_id?: number | null;
};

export type Worker = {
  id: number;
  name: string;
  father_name?: string;
  cnic: string;
  designation?: string;
  salary_per_month?: string | number;
  worker_type?: string;
  status?: string;
  mobile_no_1?: string | null;
  mobile_no_2?: string | null;
};

export type Application = {
  id: number;
  application_no: string;
  application_type: string;
  status: string;
  worker_id: number;
  recommended_rent_amount?: string | number;
  requested_unit_type?: string;
  remarks?: string | null;
  created_at?: string;
};

export type Flat = {
  id: number;
  flat_no: string;
  flat_address: string;
  flat_rooms?: number;
  status: string;
  colony_id?: number;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

export type RentInvoice = {
  id: number;
  worker_id: number;
  flat_assignment_id?: number;
  billing_month: string;
  due_date?: string;
  rent_amount: string | number;
  late_fee_amount?: string | number;
  paid_amount: string | number;
  total_amount: string | number;
  payment_mode?: string;
  deduction_status?: string;
  status: string;
};

export type Complaint = {
  id: number;
  complaint_desc: string;
  status: string;
  worker_id?: number;
  colony_id?: number;
  flat_id?: number;
  asset_id?: number;
  complaint_type?: string;
  assigned_caretaker_id?: number;
  latitude?: string | number | null;
  longitude?: string | number | null;
  allowed_radius_meters?: number | null;
  resolved_image_id?: number | null;
  resolved_latitude?: string | number | null;
  resolved_longitude?: string | number | null;
  resolved_distance_meters?: string | number | null;
  resolved_by?: number | null;
  resolved_at?: string | null;
  resolution_remarks?: string | null;
  created_at?: string;
};

export type UtilityBill = {
  id: number;
  bill_type?: string;
  consumer_number?: string;
  billing_month?: string;
  total_amount?: string | number;
  status?: string;
};

export type CaretakerTask = {
  id: number;
  asset_id?: number;
  complaint_id?: number;
  flat_id?: number;
  task_title?: string;
  title?: string;
  task_description?: string;
  description?: string;
  status?: string;
  assigned_to_user_id?: number;
  target_latitude?: string | number;
  target_longitude?: string | number;
  allowed_radius_meters?: number;
};

export type CaretakerAttendance = {
  id: number;
  user_id: number;
  duty_date?: string;
  login_time?: string;
  logout_time?: string;
  status?: string;
};

export type GpsPing = {
  id: number;
  user_id: number;
  attendance_id?: number;
  latitude: string | number;
  longitude: string | number;
  accuracy?: string | number;
  recorded_at?: string;
};

export type GenericRecord = {
  id: number;
  name?: string;
  title?: string;
  code?: string;
  status?: string;
  email?: string;
  role?: string;
  document_name?: string;
  consumer_number?: string;
  action?: string;
  entity_type?: string;
  original_file_name?: string;
  owner_type?: string;
  owner_id?: number;
  application_id?: number;
  flat_id?: number;
  district_id?: number;
  colony_id?: number;
  worker_id?: number;
  industry_id?: number;
  submitted_by_user_id?: number;
  uploaded_by_user_id?: number;
  category?: string;
  latitude?: string | number;
  longitude?: string | number;
  amount?: string | number;
  rent_amount?: string | number;
  effective_from?: string;
  effective_to?: string;
  unit_type?: string;
  start_date?: string;
  fee_type?: string;
  grace_days?: number;
  is_active?: boolean;
  max_fee_amount?: string | number;
  document_type_id?: number;
  module?: string;
  is_required?: boolean;
  allowed_file_type?: string;
  max_file_size_mb?: number;
  default_visibility?: string;
  description?: string;
  visibility?: string;
  mime_type?: string;
  rejection_reason?: string;
  remarks?: string;
  registration_no?: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  occupant_name?: string;
  occupant_cnic?: string;
  occupant_phone?: string;
  illegal_reason?: string;
  case_no?: string;
  court_name?: string;
  police_station?: string;
  administration_contact?: string;
  filed_date?: string;
  next_hearing_date?: string;
  decision_summary?: string;
  vacant_date?: string;
  eviction_case_id?: number;
  hearing_date?: string;
  proceedings?: string;
  document_id?: number;
  notification_type?: string;
  rent_invoice_id?: number;
  utility_bill_id?: number;
  payment_date?: string;
  payment_method?: string;
  receipt_no?: string;
  bill_type?: string;
  billing_month?: string;
  total_amount?: string | number;
  paid_amount?: string | number;
  created_at?: string;
};

export type DashboardSummary = {
  workers: number;
  applications: number;
  flats: number;
  complaints: number;
  rentUnpaid: number;
  utilityUnpaid: number;
  tasks: number;
};

export type DataProps = {
  workers: Worker[];
  applications: Application[];
  flats: Flat[];
  rent: RentInvoice[];
  complaints: Complaint[];
  dashboard?: DashboardSummary;
};

export type DetailField = [string, string | number | null | undefined];
export type DetailSection = { title: string; fields?: DetailField[]; items?: string[] };

export type FormField = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  helper?: string;
  options?: { value: string; label: string }[];
};

export type ModalContent =
  | { type: "view"; title: string; fields: DetailField[]; sections?: DetailSection[] }
  | { type: "confirm"; title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void }
  | { type: "form"; title: string; submitLabel?: string; fields: FormField[]; onSubmit: (data: Record<string, string>) => void };
