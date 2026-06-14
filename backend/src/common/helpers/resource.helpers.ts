import { BadRequestException } from '@nestjs/common';

export type ResourceConfig = {
  model: string;
  idField?: string;
  searchable?: string[];
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  softDeleteStatus?: string;
};

export const resources: Record<string, ResourceConfig> = {
  users: { model: 'users', searchable: ['name', 'email', 'phone_number'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'disabled' },
  industries: { model: 'industries', searchable: ['name', 'registration_no', 'email', 'phone'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'disabled' },
  'industry-users': { model: 'industry_users', defaultOrderBy: { id: 'desc' } },
  districts: { model: 'districts', searchable: ['name'], defaultOrderBy: { id: 'desc' } },
  colonies: { model: 'colonies', searchable: ['name', 'address'], defaultOrderBy: { id: 'desc' } },
  zones: { model: 'zones', searchable: ['name'], defaultOrderBy: { id: 'asc' } },
  'residential-units': { model: 'residential_units', searchable: ['flat_no', 'flat_address'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'sealed' },
  workers: { model: 'workers', searchable: ['name', 'father_name', 'cnic', 'essi_no', 'eobi_no', 'mobile_no_1'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'inactive' },
  'worker-applications': { model: 'worker_applications', searchable: ['application_no', 'requested_unit_type'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'cancelled' },
  'document-types': { model: 'document_types', searchable: ['name', 'code', 'module'], defaultOrderBy: { id: 'desc' } },
  documents: { model: 'documents', searchable: ['original_file_name', 'mime_type', 'remarks'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'archived' },
  'flat-assignments': { model: 'flat_assignments', searchable: ['allotment_order_no', 'remarks'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'cancelled' },
  'rent-rates': { model: 'rent_rates', searchable: ['unit_type'], defaultOrderBy: { id: 'desc' } },
  'late-fee-rules': { model: 'late_fee_rules', searchable: ['name'], defaultOrderBy: { id: 'desc' } },
  'rent-invoices': { model: 'rent_invoices', defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'cancelled' },
  'rent-payments': { model: 'rent_payments', searchable: ['receipt_no', 'payment_method'], defaultOrderBy: { id: 'desc' } },
  'rent-remittances': { model: 'rent_remittances', searchable: ['remarks', 'status'], defaultOrderBy: { id: 'desc' } },
  'caretaker-colonies': { model: 'caretaker_colonies', defaultOrderBy: { id: 'desc' } },
  'utility-connections': { model: 'utility_connections', searchable: ['provider_name', 'consumer_number'], defaultOrderBy: { id: 'desc' } },
  'utility-bills': { model: 'utility_bills', defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'cancelled' },
  'utility-payments': { model: 'utility_payments', searchable: ['receipt_no'], defaultOrderBy: { id: 'desc' } },
  'utility-fetch-attempts': { model: 'utility_bill_fetch_attempts', searchable: ['api_response_code', 'error_message'], defaultOrderBy: { id: 'desc' } },
  complaints: { model: 'complaints', searchable: ['complaint_desc'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'rejected' },
  'complaint-budgets': { model: 'complaint_budgets', defaultOrderBy: { id: 'desc' } },
  assets: { model: 'assets', searchable: ['name', 'address', 'category'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'inactive' },
  'asset-status-history': { model: 'asset_status_history', defaultOrderBy: { id: 'desc' } },
  'caretaker-attendance': { model: 'caretaker_attendance', defaultOrderBy: { id: 'desc' } },
  'caretaker-gps': { model: 'caretaker_gps_tracking', defaultOrderBy: { id: 'desc' } },
  'caretaker-tasks': { model: 'caretaker_tasks', searchable: ['task_title', 'task_description'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'cancelled' },
  'task-proofs': { model: 'task_proofs', searchable: ['remarks'], defaultOrderBy: { id: 'desc' } },
  'eviction-cases': { model: 'eviction_cases', searchable: ['occupant_name', 'occupant_cnic', 'case_no', 'court_name', 'police_station', 'illegal_reason'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'closed' },
  'eviction-hearings': { model: 'eviction_hearings', searchable: ['proceedings', 'decision_summary'], defaultOrderBy: { id: 'desc' } },
  notifications: { model: 'notifications', searchable: ['title', 'message', 'notification_type'], defaultOrderBy: { id: 'desc' }, softDeleteStatus: 'failed' },
  'audit-logs': { model: 'audit_logs', searchable: ['action', 'entity_type', 'ip_address'], defaultOrderBy: { id: 'desc' } },
};

const dateFields = new Set([
  'dob',
  'duty_date',
  'start_date',
  'end_date',
  'allotment_order_date',
  'billing_month',
  'due_date',
  'payment_date',
  'effective_from',
  'effective_to',
  'submitted_at',
  'verified_at',
  'committee_decision_date',
  'approved_at',
  'rejected_at',
  'assigned_at',
  'due_at',
  'login_time',
  'logout_time',
  'recorded_at',
  'uploaded_at',
  'filed_date',
  'hearing_date',
  'next_hearing_date',
  'vacant_date',
  'sent_at',
  'read_at',
]);

const bigintFields = new Set([
  'amount',
  'budget',
  'salary_per_month',
  'rent_amount',
  'late_fee_amount',
  'total_amount',
  'paid_amount',
  'max_fee_amount',
  'file_size',
]);

export function getResource(resource: string): ResourceConfig {
  const config = resources[resource];
  if (!config) {
    throw new BadRequestException(`Unknown API resource: ${resource}`);
  }
  return config;
}

export function parseId(id: string): number {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('id must be a positive integer');
  }
  return parsed;
}

export function coerceData(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Body must be a JSON object');
  }

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === '') continue;
    if (value === null) {
      output[key] = null;
      continue;
    }
    if (dateFields.has(key) || key.endsWith('_at') || key.endsWith('_date')) {
      output[key] = new Date(String(value));
      continue;
    }
    if (bigintFields.has(key) || key.endsWith('_amount')) {
      output[key] = BigInt(String(value));
      continue;
    }
    output[key] = value;
  }
  return output;
}

export function normalizeQuery(query: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...query };
  if (normalized.search && !normalized.q) normalized.q = normalized.search;
  delete normalized.search;
  for (const [key, value] of Object.entries(normalized)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'is_active' || key === 'is_required') {
      normalized[key] = value === true || value === 'true';
    } else if (key === 'date_from' || key === 'date_to' || key === 'billing_month') {
      normalized[key] = new Date(String(value));
    } else if (key === 'id' || key.endsWith('_id') || ['flat_rooms', 'page', 'limit'].includes(key)) {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) normalized[key] = numeric;
    }
  }
  return normalized;
}

export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value: unknown) => {
      if (typeof value === 'bigint') return value.toString();
      if (value && typeof value === 'object' && 'toString' in value && value.constructor?.name === 'Decimal') {
        return value.toString();
      }
      return value;
    }),
  ) as T;
}

export function buildListQuery(config: ResourceConfig, query: Record<string, unknown>) {
  query = normalizeQuery(query);
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 25), 1), 100);
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  for (const [key, value] of Object.entries(query)) {
    if (['page', 'limit', 'q', 'include', 'sort_by', 'sort_order', 'date_from', 'date_to'].includes(key) || value === undefined || value === '') continue;
    where[key] = value;
  }

  if (query.date_from || query.date_to) {
    where.created_at = {
      ...(query.date_from ? { gte: query.date_from } : {}),
      ...(query.date_to ? { lte: query.date_to } : {}),
    };
  }

  if (q && config.searchable?.length) {
    where.OR = config.searchable.map((field) => ({ [field]: { contains: q, mode: 'insensitive' } }));
  }

  return {
    where,
    skip,
    take: limit,
    orderBy:
      typeof query.sort_by === 'string'
        ? { [query.sort_by]: query.sort_order === 'asc' ? 'asc' : 'desc' }
        : (config.defaultOrderBy ?? { id: 'desc' }),
    page,
    limit,
  };
}

export function response<T>(message: string, data: T, meta?: Record<string, unknown>) {
  return serialize({ success: true, message, data, errors: null, ...(meta ? { meta } : {}) });
}

export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}
