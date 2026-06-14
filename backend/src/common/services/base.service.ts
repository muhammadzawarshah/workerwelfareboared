import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { buildListQuery, coerceData, distanceMeters, getResource, parseId, response } from '../helpers/resource.helpers';
import { AD_COLONIES_ROLES, canAccess, ROLES } from '../roles/roles.util';

type PrismaTx = {
  users: { findMany(args: Record<string, unknown>): Promise<{ id: number }[]> };
  notifications: { createMany(args: Record<string, unknown>): Promise<unknown> };
};

type PrismaModel = {
  findMany(args?: Record<string, unknown>): Promise<unknown[]>;
  count(args?: Record<string, unknown>): Promise<number>;
  findUnique(args: Record<string, unknown>): Promise<unknown>;
  findFirst(args: Record<string, unknown>): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
};

type AuthUser = { sub?: number; id?: number; role?: string };
type UploadedDocumentFile = {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class BaseService {
  constructor(protected readonly prisma: PrismaService) {}

  private model(name: string): PrismaModel {
    const model = (this.prisma as unknown as Record<string, PrismaModel>)[name];
    if (!model) throw new BadRequestException(`Prisma model not found: ${name}`);
    return model;
  }

  private userId(user?: AuthUser): number | undefined {
    return user?.sub ?? user?.id;
  }

  // Throws unless the acting user holds one of the allowed roles. super_admin /
  // admin always pass (see canAccess). Used to gate the flat-allotment workflow
  // handoffs so each stage is performed by the responsible office only.
  private requireRole(user: AuthUser | undefined, action: string, ...allowed: string[]): void {
    if (!canAccess(user?.role, ...allowed)) {
      throw new ForbiddenException(`Your role (${user?.role ?? 'unknown'}) is not allowed to ${action}`);
    }
  }

  // Denylist guard: blocks the listed roles from an action while leaving every
  // other (existing) role untouched. Used so the caretaker stays view-only on
  // flats without re-permissioning the roles that already manage them.
  private denyRoles(user: AuthUser | undefined, action: string, ...denied: string[]): void {
    if (user?.role && denied.includes(user.role)) {
      throw new ForbiddenException(`Your role (${user.role}) is not allowed to ${action}`);
    }
  }

  // Fan a notification out to every active user holding any of the given roles.
  // Best-effort: a stage with no users in that role simply gets no notification.
  private async notifyRole(
    tx: PrismaTx,
    roles: string | readonly string[],
    payload: { application_id?: number; title: string; message: string; notification_type: string },
  ): Promise<void> {
    const roleList = Array.isArray(roles) ? [...roles] : [roles as string];
    const recipients = await tx.users.findMany({
      where: { role: { in: roleList }, status: 'active' },
      select: { id: true },
    });
    if (!recipients.length) return;
    await tx.notifications.createMany({
      data: recipients.map((recipient) => ({
        recipient_type: 'user',
        recipient_id: recipient.id,
        application_id: payload.application_id,
        title: payload.title,
        message: payload.message,
        notification_type: payload.notification_type,
        status: 'sent',
        sent_at: new Date(),
      })),
    });
  }

  private async industryIdsForUser(user?: AuthUser): Promise<number[]> {
    const id = this.userId(user);
    if (!id || user?.role !== 'industry_admin') return [];
    const rows = await this.prisma.industry_users.findMany({
      where: { user_id: id },
      orderBy: [{ is_primary: 'desc' }, { id: 'asc' }],
      select: { industry_id: true },
    });
    return rows.map((row) => row.industry_id);
  }

  // Active colony ids a caretaker is responsible for (rent collection scope).
  private async caretakerColonyIds(user?: AuthUser): Promise<number[]> {
    const id = this.userId(user);
    if (!id) return [];
    const rows = await this.prisma.caretaker_colonies.findMany({
      where: { user_id: id, is_active: true },
      select: { colony_id: true },
    });
    return rows.map((row) => row.colony_id);
  }

  private async scopedWhere(resource: string, where: Record<string, unknown>, user?: AuthUser): Promise<Record<string, unknown>> {
    if (user?.role === 'industry_admin') {
      const industryIds = await this.industryIdsForUser(user);
      if (!industryIds.length) return { AND: [where, { id: -1 }] };
      if (resource === 'worker-applications') {
        return { AND: [where, { industry_id: { in: industryIds } }] };
      }
      if (resource === 'workers') {
        return { AND: [where, { worker_applications: { some: { industry_id: { in: industryIds } } } }] };
      }
      return where;
    }
    // A caretaker only sees rent vouchers for the colony they are posted to, and
    // only the payments they personally collected.
    if (user?.role === ROLES.careTakerLabourColony) {
      if (resource === 'rent-invoices') {
        const colonyIds = await this.caretakerColonyIds(user);
        if (!colonyIds.length) return { AND: [where, { id: -1 }] };
        return { AND: [where, { flat_assignments: { residential_units: { colony_id: { in: colonyIds } } } }] };
      }
      if (resource === 'rent-payments') {
        return { AND: [where, { collected_user_id: this.userId(user) }] };
      }
      // A caretaker may only view the flats of the colony they are posted to.
      if (resource === 'residential-units') {
        const colonyIds = await this.caretakerColonyIds(user);
        if (!colonyIds.length) return { AND: [where, { id: -1 }] };
        return { AND: [where, { colony_id: { in: colonyIds } }] };
      }
    }
    return where;
  }

  async list(resource: string, query: Record<string, unknown>, user?: AuthUser) {
    const config = getResource(resource);
    const model = this.model(config.model);
    const listQuery = buildListQuery(config, query);
    const where = await this.scopedWhere(resource, listQuery.where, user);
    const [items, total] = await Promise.all([
      model.findMany({
        where,
        skip: listQuery.skip,
        take: listQuery.take,
        orderBy: listQuery.orderBy,
      }),
      model.count({ where }),
    ]);
    const enriched = resource === 'users' ? await this.attachUserColonies(items) : items;
    return response(`${resource} fetched successfully`, enriched, {
      total,
      page: listQuery.page,
      limit: listQuery.limit,
      totalPages: Math.ceil(total / listQuery.limit),
    });
  }

  // Adds `colony_id` (the active caretaker colony, or null) to each user row so
  // the staff table can show the assigned colony. The link lives in
  // caretaker_colonies, not on the users table itself.
  private async attachUserColonies(items: unknown[]): Promise<unknown[]> {
    const users = items as { id: number }[];
    const ids = users.map((user) => user.id).filter((id) => Number.isInteger(id));
    if (!ids.length) return items;
    const links = await this.prisma.caretaker_colonies.findMany({
      where: { user_id: { in: ids }, is_active: true },
      select: { user_id: true, colony_id: true },
      orderBy: { id: 'desc' },
    });
    const colonyByUser = new Map<number, number>();
    for (const link of links) {
      if (!colonyByUser.has(link.user_id)) colonyByUser.set(link.user_id, link.colony_id);
    }
    return users.map((user) => ({ ...user, colony_id: colonyByUser.get(user.id) ?? null }));
  }

  async findOne(resource: string, id: string) {
    const config = getResource(resource);
    const item = await this.model(config.model).findUnique({ where: { id: parseId(id) } });
    if (!item) throw new NotFoundException(`${resource} record not found`);
    return response(`${resource} record fetched successfully`, item);
  }

  async create(resource: string, body: unknown, user?: AuthUser) {
    const config = getResource(resource);
    const data = coerceData(body);
    // Colonies are set up by the colony section / director, not by AD (Colonies),
    // who only oversee existing colonies in their zone.
    if (resource === 'colonies') {
      this.requireRole(user, 'create a colony', ROLES.colonySection, ROLES.directorAdmin);
    }
    // The caretaker is view-only on flats; they cannot create residential units.
    if (resource === 'residential-units') {
      this.denyRoles(user, 'create a flat / residential unit', ROLES.careTakerLabourColony);
    }
    if (resource === 'users') {
      return this.createUser(data);
    }
    if (resource === 'rent-payments') {
      return this.payRentInvoice(String(data.rent_invoice_id), data, user);
    }
    if (resource === 'utility-payments') {
      return this.payUtilityBill(String(data.utility_bill_id), data, user);
    }
    if (resource === 'task-proofs') {
      return this.createTaskProof(data, user);
    }
    const currentUserId = this.userId(user);
    if (currentUserId && ['created_by', 'uploaded_by', 'submitted_by_user_id'].some((field) => field in data === false)) {
      if (['colonies', 'industries', 'residential-units', 'flat-assignments', 'rent-rates', 'late-fee-rules', 'utility-bills'].includes(resource)) {
        data.created_by = currentUserId;
      }
      if (resource === 'documents') data.uploaded_by = currentUserId;
      if (resource === 'worker-applications') data.submitted_by_user_id = currentUserId;
    }
    if (resource === 'worker-applications' && user?.role === 'industry_admin') {
      const industryIds = await this.industryIdsForUser(user);
      if (!industryIds.length) throw new BadRequestException('Industry admin is not attached to any industry');
      data.industry_id = industryIds[0];
    }
    const item = await this.prisma.$transaction((tx) => {
      const model = (tx as unknown as Record<string, PrismaModel>)[config.model];
      return model.create({ data });
    });
    return response(`${resource} record created successfully`, item);
  }

  // Creates the worker and its application atomically: if the application insert
  // fails, the worker insert is rolled back too (no half-saved records).
  async createWorkerWithApplication(body: unknown, user?: AuthUser) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Payload must include worker and application objects');
    }
    const payload = body as { worker?: unknown; application?: unknown };
    const workerData = coerceData(payload.worker ?? {});
    const applicationData = coerceData(payload.application ?? {});

    if (!workerData.name || !workerData.cnic) {
      throw new BadRequestException('Worker name and CNIC are required');
    }
    if (!applicationData.application_no || !applicationData.application_type) {
      throw new BadRequestException('application_no and application_type are required');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const worker = await tx.workers.create({ data: workerData as never });
      const application = await tx.worker_applications.create({
        data: {
          ...(applicationData as Record<string, never>),
          worker_id: worker.id,
          submitted_by_user_id: applicationData.submitted_by_user_id ?? this.userId(user),
        } as never,
      });
      return { worker, application };
    });

    return response('Worker application created successfully', result);
  }

  async update(resource: string, id: string, body: unknown, user?: AuthUser) {
    const config = getResource(resource);
    const data = coerceData(body);
    // The caretaker is view-only on flats; they cannot edit residential units.
    if (resource === 'residential-units') {
      this.denyRoles(user, 'modify a flat / residential unit', ROLES.careTakerLabourColony);
    }
    // The staff screen assigns a colony to a caretaker through the user-update
    // endpoint, but `users` has no colony_id column — the link lives in
    // caretaker_colonies. Route colony_id there and update the rest normally.
    if (resource === 'users' && 'colony_id' in data) {
      return this.updateUserColonies(parseId(id), data);
    }
    const item = await this.prisma.$transaction((tx) => {
      const model = (tx as unknown as Record<string, PrismaModel>)[config.model];
      return model.update({
        where: { id: parseId(id) },
        data,
      });
    });
    return response(`${resource} record updated successfully`, item);
  }

  // Replaces a caretaker's active colony set with the selected colony/colonies
  // (a caretaker manages one colony, but an array is accepted too), then applies
  // any other user fields included in the same update.
  private async updateUserColonies(userId: number, data: Record<string, unknown>) {
    const rawColony = data.colony_id;
    delete data.colony_id;
    const colonyIds = (Array.isArray(rawColony) ? rawColony : [rawColony])
      .filter((value) => value !== null && value !== undefined && value !== '')
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.caretaker_colonies.updateMany({ where: { user_id: userId }, data: { is_active: false } });
      for (const colonyId of colonyIds) {
        await tx.caretaker_colonies.upsert({
          where: { user_id_colony_id: { user_id: userId, colony_id: colonyId } },
          create: { user_id: userId, colony_id: colonyId },
          update: { is_active: true },
        });
      }
      if (Object.keys(data).length) {
        await tx.users.update({ where: { id: userId }, data: data as never });
      }
    });

    const colonies = await this.prisma.caretaker_colonies.findMany({
      where: { user_id: userId, is_active: true },
      include: { colonies: true },
    });
    return response('User colony assignment updated successfully', {
      id: userId,
      user_id: userId,
      colony_id: colonies[0]?.colony_id ?? null,
      colonies,
    });
  }

  async remove(resource: string, id: string, user?: AuthUser) {
    const config = getResource(resource);
    // The caretaker is view-only on flats; they cannot delete residential units.
    if (resource === 'residential-units') {
      this.denyRoles(user, 'delete a flat / residential unit', ROLES.careTakerLabourColony);
    }
    const model = this.model(config.model);
    const numericId = parseId(id);
    if (config.softDeleteStatus) {
      const item = await this.prisma.$transaction((tx) => {
        const txModel = (tx as unknown as Record<string, PrismaModel>)[config.model];
        return txModel.update({ where: { id: numericId }, data: { status: config.softDeleteStatus } });
      });
      return response(`${resource} record status updated successfully`, item);
    }
    const item = await this.prisma.$transaction((tx) => {
      const txModel = (tx as unknown as Record<string, PrismaModel>)[config.model];
      return txModel.delete({ where: { id: numericId } });
    });
    return response(`${resource} record deleted successfully`, item);
  }

  async createUser(data: Record<string, unknown>) {
    const password = String(data.password ?? '');
    if (!password) throw new BadRequestException('password is required');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/.test(password)) {
      throw new BadRequestException('Password must be at least 12 characters and include uppercase, lowercase, and number');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    delete data.password;
    const item = await this.prisma.$transaction((tx) =>
      tx.users.create({
        data: {
          ...(data as Record<string, never>),
          password_hash: passwordHash,
        } as never,
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          status: true,
          profile_photo: true,
          role: true,
          created_at: true,
        },
      }),
    );
    return response('users record created successfully', item);
  }

  async updateStatus(resource: string, id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const statusValue = data.status ?? data.is_active;
    if (statusValue === undefined) throw new BadRequestException('status or is_active is required');
    const field = data.is_active === undefined ? 'status' : 'is_active';
    return this.update(resource, id, { [field]: statusValue }, user);
  }

  async searchWorker(query: Record<string, unknown>) {
    const value = String(query.cnic ?? query.essi_no ?? query.eobi_no ?? query.mobile ?? query.q ?? query.search ?? '').trim();
    if (!value) throw new BadRequestException('Provide cnic, essi_no, eobi_no, or q');
    const data = await this.prisma.workers.findMany({
      where: {
        OR: [
          { cnic: { contains: value } },
          { essi_no: { contains: value } },
          { eobi_no: { contains: value } },
          { name: { contains: value, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { id: 'desc' },
    });
    return response('Workers searched successfully', data);
  }

  async workerByCnic(cnic: string) {
    const worker = await this.prisma.workers.findUnique({ where: { cnic } });
    if (!worker) throw new NotFoundException('Worker not found');
    return response('Worker fetched successfully', worker);
  }

  async related(parent: string, id: string, child: string, query: Record<string, unknown> = {}) {
    const numericId = parseId(id);
    const map: Record<string, { resource: string; where: Record<string, unknown> }> = {
      'industries/users': { resource: 'industry-users', where: { industry_id: numericId } },
      'industries/workers': { resource: 'worker-applications', where: { industry_id: numericId } },
      'industries/applications': { resource: 'worker-applications', where: { industry_id: numericId } },
      'residential-units/history': { resource: 'flat-assignments', where: { flat_id: numericId } },
      'workers/applications': { resource: 'worker-applications', where: { worker_id: numericId } },
      'workers/documents': { resource: 'documents', where: { owner_type: 'worker', owner_id: numericId } },
      'workers/flat-assignments': { resource: 'flat-assignments', where: { worker_id: numericId } },
      'workers/rent-invoices': { resource: 'rent-invoices', where: { worker_id: numericId } },
      'workers/utility-bills': { resource: 'utility-bills', where: { worker_id: numericId } },
      'workers/complaints': { resource: 'complaints', where: { worker_id: numericId } },
      'worker-applications/documents': { resource: 'documents', where: { application_id: numericId } },
      'assets/status-history': { resource: 'asset-status-history', where: { asset_id: numericId } },
    };
    if (parent === 'workers' && child === 'current-flat') {
      const item = await this.prisma.flat_assignments.findFirst({
        where: { worker_id: numericId, status: 'active' },
        include: { residential_units: true },
      });
      return response('Current flat fetched successfully', item);
    }
    if (parent === 'worker-applications' && child === 'history') {
      const item = await this.prisma.worker_applications.findUnique({
        where: { id: numericId },
        include: { documents: true, flat_assignments_flat_assignments_application_idToworker_applications: true, notifications: true },
      });
      return response('Application history fetched successfully', item);
    }
    const rel = map[`${parent}/${child}`];
    if (!rel) throw new BadRequestException('Unknown related endpoint');
    return this.list(rel.resource, { ...query, ...rel.where });
  }

  async addIndustryUser(id: string, body: unknown) {
    const data = coerceData(body);
    const item = await this.prisma.$transaction((tx) =>
      tx.industry_users.create({
        data: {
          industry_id: parseId(id),
          user_id: Number(data.user_id),
          designation: data.designation as string | undefined,
          is_primary: Boolean(data.is_primary ?? false),
        },
      }),
    );
    return response('Industry user attached successfully', item);
  }

  async availableUnits(query: Record<string, unknown>, user?: AuthUser) {
    const where: Record<string, unknown> = { status: 'empty' };
    if (query.colony_id) where.colony_id = Number(query.colony_id);
    if (query.unit_type) where.flat_rooms = Number(query.unit_type);
    // A caretaker only sees units in the colony they are posted to.
    if (user?.role === ROLES.careTakerLabourColony) {
      const colonyIds = await this.caretakerColonyIds(user);
      where.colony_id = colonyIds.length ? { in: colonyIds } : -1;
    }
    const units = await this.prisma.residential_units.findMany({ where, orderBy: { id: 'desc' } });
    return response('Available residential units fetched successfully', units);
  }

  async submitApplication(id: string, user?: AuthUser) {
    const data = await this.prisma.worker_applications.update({
      where: { id: parseId(id) },
      data: {
        status: 'submitted',
        submitted_at: new Date(),
        submitted_by_user_id: this.userId(user),
      },
    });
    return response('Application submitted successfully', data);
  }

  async verifyApplication(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const passed = data.verification_status === 'passed';
    const recommendedRent = data.recommended_rent_amount ? BigInt(String(data.recommended_rent_amount)) : undefined;
    if (passed && (!recommendedRent || recommendedRent <= BigInt(0))) {
      throw new BadRequestException('recommended_rent_amount is required before moving application to committee');
    }
    const app = await this.prisma.worker_applications.update({
      where: { id: parseId(id) },
      data: {
        status: passed ? 'verified' : 'verification_failed',
        verification_status: passed ? 'passed' : 'failed',
        verification_remarks: data.verification_remarks as string | undefined,
        recommended_rent_amount: recommendedRent,
        verified_by: this.userId(user),
        verified_at: new Date(),
      },
    });
    return response('Application verification updated successfully', app);
  }

  async rejectVerification(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const app = await this.prisma.$transaction((tx) =>
      tx.worker_applications.update({
        where: { id: parseId(id) },
        data: {
          status: 'verification_failed',
          verification_status: 'failed',
          verification_remarks: data.verification_remarks as string | undefined,
          verified_by: this.userId(user),
          verified_at: new Date(),
        },
      }),
    );
    return response('Application verification rejected successfully', app);
  }

  async committeeDecision(id: string, body: unknown) {
    const data = coerceData(body);
    const decision = String(data.committee_decision ?? data.decision ?? '');
    if (!['approved', 'rejected', 'deferred'].includes(decision)) {
      throw new BadRequestException('committee_decision must be approved, rejected, or deferred');
    }
    const status = decision === 'approved' ? 'committee_pending' : decision === 'rejected' ? 'rejected' : 'committee_pending';
    const app = await this.prisma.worker_applications.update({
      where: { id: parseId(id) },
      data: {
        committee_decision: decision as never,
        committee_decision_date: data.committee_decision_date ?? new Date(),
        committee_remarks: data.committee_remarks as string | undefined,
        status,
      },
    });
    return response('Committee decision saved successfully', app);
  }

  // Stage 4 (approve): the committee / chairman approves the application, then
  // it returns to AD (Colonies) so they can issue the allotment notification.
  async approveApplication(id: string, body: unknown, user?: AuthUser) {
    this.requireRole(user, 'approve an application', ROLES.chairmanKpWwb, ROLES.secretaryKpWwb, ROLES.directorAdmin);
    const data = coerceData(body);
    const app = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.worker_applications.update({
        where: { id: parseId(id) },
        data: {
          status: 'approved',
          committee_decision: (data.committee_decision ?? 'approved') as never,
          committee_decision_date: new Date(),
          committee_remarks: data.committee_remarks as string | undefined,
          approved_by: this.userId(user),
          approved_at: new Date(),
          remarks: data.remarks as string | undefined,
        } as never,
      });
      await tx.workers.update({ where: { id: updated.worker_id }, data: { status: 'active' } });
      await this.notifyRole(tx as unknown as PrismaTx, AD_COLONIES_ROLES, {
        application_id: updated.id,
        title: 'Application approved by committee',
        message: `Application ${updated.application_no} was approved. Issue the allotment notification to the worker.`,
        notification_type: 'committee_approved',
      });
      return updated;
    });
    return response('Application approved successfully', app);
  }

  async deferApplication(id: string, body: unknown) {
    const data = coerceData(body);
    const app = await this.prisma.$transaction((tx) =>
      tx.worker_applications.update({
        where: { id: parseId(id) },
        data: {
          status: 'committee_pending',
          committee_decision: 'deferred',
          committee_decision_date: new Date(),
          committee_remarks: data.committee_remarks as string | undefined,
        },
      }),
    );
    return response('Application deferred successfully', app);
  }

  async cancelApplication(id: string) {
    const app = await this.prisma.$transaction((tx) =>
      tx.worker_applications.update({ where: { id: parseId(id) }, data: { status: 'cancelled' } }),
    );
    return response('Application cancelled successfully', app);
  }

  // Stage 4 (reject): the committee / chairman rejects the application; AD
  // (Colonies) is notified so they can inform the worker / industry.
  async rejectApplication(id: string, body: unknown, user?: AuthUser) {
    this.requireRole(user, 'reject an application', ROLES.chairmanKpWwb, ROLES.secretaryKpWwb, ROLES.directorAdmin);
    const data = coerceData(body);
    const app = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.worker_applications.update({
        where: { id: parseId(id) },
        data: {
          status: 'rejected',
          committee_decision: 'rejected' as never,
          committee_decision_date: new Date(),
          committee_remarks: (data.committee_remarks ?? data.rejected_reason ?? data.reason) as string | undefined,
          rejected_by: this.userId(user),
          rejected_at: new Date(),
          rejected_reason: (data.rejected_reason ?? data.reason) as string | undefined,
        } as never,
      });
      await tx.workers.update({ where: { id: updated.worker_id }, data: { status: 'rejected' } });
      await this.notifyRole(tx as unknown as PrismaTx, AD_COLONIES_ROLES, {
        application_id: updated.id,
        title: 'Application rejected by committee',
        message: `Application ${updated.application_no} was rejected by the committee. Please inform the worker / industry.`,
        notification_type: 'committee_rejected',
      });
      return updated;
    });
    return response('Application rejected successfully', app);
  }

  // --- Flat-allotment workflow handoffs -----------------------------------
  // Stage 2: the labour-colony caretaker reviews a submitted application and
  // moves it up to the AD (Colonies) office for processing.
  async forwardApplicationToAdColony(id: string, body: unknown, user?: AuthUser) {
    this.requireRole(user, 'forward an application to AD (Colonies)', ROLES.careTakerLabourColony, ...AD_COLONIES_ROLES, ROLES.directorAdmin);
    const data = coerceData(body);
    const app = await this.prisma.$transaction(async (tx) => {
      const current = await tx.worker_applications.findUnique({ where: { id: parseId(id) } });
      if (!current) throw new NotFoundException('Worker application not found');
      if (!['submitted', 'under_verification'].includes(current.status)) {
        throw new BadRequestException(`Application in status "${current.status}" cannot be moved to AD (Colonies). It must be submitted first.`);
      }
      const updated = await tx.worker_applications.update({
        where: { id: current.id },
        data: {
          status: 'under_verification',
          remarks: (data.remarks as string | undefined) ?? current.remarks,
        },
      });
      await this.notifyRole(tx as unknown as PrismaTx, AD_COLONIES_ROLES, {
        application_id: updated.id,
        title: 'New allotment application',
        message: `Application ${updated.application_no} was forwarded by the caretaker for AD (Colonies) review.`,
        notification_type: 'application_forwarded',
      });
      return updated;
    });
    return response('Application forwarded to AD (Colonies) successfully', app);
  }

  // Stage 3: AD (Colonies) verifies the application, fixes the recommended rent
  // and sends it on to the allotment committee / chairman for a decision.
  async forwardApplicationToCommittee(id: string, body: unknown, user?: AuthUser) {
    this.requireRole(user, 'send an application to the committee', ...AD_COLONIES_ROLES, ROLES.colonySection, ROLES.directorAdmin);
    const data = coerceData(body);
    const recommendedRent = data.recommended_rent_amount ? BigInt(String(data.recommended_rent_amount)) : undefined;
    if (!recommendedRent || recommendedRent <= BigInt(0)) {
      throw new BadRequestException('recommended_rent_amount is required before sending the application to the committee');
    }
    const app = await this.prisma.$transaction(async (tx) => {
      const current = await tx.worker_applications.findUnique({ where: { id: parseId(id) } });
      if (!current) throw new NotFoundException('Worker application not found');
      if (!['under_verification', 'verified', 'committee_pending'].includes(current.status)) {
        throw new BadRequestException(`Application in status "${current.status}" cannot be sent to the committee. It must be forwarded to AD (Colonies) first.`);
      }
      const updated = await tx.worker_applications.update({
        where: { id: current.id },
        data: {
          status: 'committee_pending',
          verification_status: 'passed',
          verification_remarks: data.verification_remarks as string | undefined,
          recommended_rent_amount: recommendedRent,
          verified_by: this.userId(user),
          verified_at: new Date(),
          committee_meeting_id: data.committee_meeting_id ? Number(data.committee_meeting_id) : undefined,
        },
      });
      await this.notifyRole(tx as unknown as PrismaTx, [ROLES.chairmanKpWwb, ROLES.secretaryKpWwb], {
        application_id: updated.id,
        title: 'Application pending committee decision',
        message: `Application ${updated.application_no} is ready for the allotment committee's decision.`,
        notification_type: 'committee_pending',
      });
      return updated;
    });
    return response('Application sent to committee successfully', app);
  }

  // Stage 5: after the committee approves, AD (Colonies) issues the allotment
  // notification to the worker / industry and tells the caretaker to hand over
  // the flat. The signed allotment order must already be attached as a document.
  async issueAllotmentNotification(id: string, body: unknown, user?: AuthUser) {
    this.requireRole(user, 'issue an allotment notification', ...AD_COLONIES_ROLES, ROLES.colonySection, ROLES.directorAdmin);
    const data = coerceData(body);
    const result = await this.prisma.$transaction(async (tx) => {
      const application = await tx.worker_applications.findUnique({
        where: { id: parseId(id) },
        include: { workers: true, industries: { include: { industry_users: true } } },
      });
      if (!application) throw new NotFoundException('Worker application not found');
      if (application.status !== 'approved') {
        throw new BadRequestException('Only committee-approved applications can be notified for allotment');
      }
      const allotmentDocs = await tx.documents.count({
        where: { application_id: application.id, owner_type: 'allotment', visibility: 'worker', status: { not: 'rejected' } },
      });
      if (!allotmentDocs) {
        throw new BadRequestException('Attach the allotment order (owner_type=allotment, visibility=worker) before issuing the notification');
      }
      const industryUsers = application.industries?.industry_users ?? [];
      const recipients: Record<string, unknown>[] = industryUsers.map((industryUser) => ({
        recipient_type: 'user',
        recipient_id: industryUser.user_id,
        application_id: application.id,
        title: 'Flat allotment approved',
        message: `${application.workers.name} has been allotted a flat. Please coordinate with the colony caretaker for possession.`,
        notification_type: 'allotment_notification',
        status: 'sent',
        sent_at: new Date(),
      }));
      recipients.push({
        recipient_type: 'worker',
        recipient_id: application.worker_id,
        application_id: application.id,
        title: 'Flat allotment approved',
        message: `Dear ${application.workers.name}, your flat allotment has been approved. Please contact the colony caretaker for possession.`,
        notification_type: 'allotment_notification',
        status: 'sent',
        sent_at: new Date(),
      });
      if (data.remarks) {
        recipients.forEach((recipient) => {
          recipient.message = `${recipient.message as string} Note: ${data.remarks as string}`;
        });
      }
      await tx.notifications.createMany({ data: recipients as never });
      await this.notifyRole(tx as unknown as PrismaTx, ROLES.careTakerLabourColony, {
        application_id: application.id,
        title: 'Flat ready for possession',
        message: `Application ${application.application_no} is approved and notified. Please assign the flat to ${application.workers.name}.`,
        notification_type: 'allotment_ready',
      });
      return application;
    });
    return response('Allotment notification issued successfully', result);
  }

  // After the committee approves, AD (Colonies) does the flat assignment and
  // attaches the allotment notification. The colony's caretaker and the worker's
  // industry are then notified — the caretaker hands over possession; the
  // industry just sees the allotment.
  async assignFlat(body: unknown, user?: AuthUser) {
    this.requireRole(user, 'assign a flat', ...AD_COLONIES_ROLES, ROLES.colonySection, ROLES.directorAdmin);
    const data = coerceData(body);
    const workerId = Number(data.worker_id);
    const flatId = Number(data.flat_id);
    if (!workerId || !flatId) throw new BadRequestException('worker_id and flat_id are required');
    const rentAmount = BigInt(String(data.rent_amount ?? 0));
    if (rentAmount <= BigInt(0)) throw new BadRequestException('rent_amount is required and must be greater than zero');
    const applicationId = data.application_id ? Number(data.application_id) : undefined;
    if (applicationId) {
      const notificationDocs = await this.prisma.documents.count({
        where: {
          application_id: applicationId,
          owner_type: 'allotment',
          visibility: 'worker',
          status: { not: 'rejected' },
        },
      });
      if (!notificationDocs) {
        throw new BadRequestException('Worker notification PDF/image is required before flat assignment');
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      await tx.flat_assignments.updateMany({
        where: { worker_id: workerId, status: 'active' },
        data: { status: 'transferred', end_date: new Date() },
      });
      const assignment = await tx.flat_assignments.create({
        data: {
          worker_id: workerId,
          flat_id: flatId,
          application_id: applicationId,
          start_date: data.start_date ? (data.start_date as Date) : new Date(),
          allotment_order_no: data.allotment_order_no as string | undefined,
          allotment_order_date: data.allotment_order_date as Date | undefined,
          rent_amount: rentAmount,
          remarks: data.remarks as string | undefined,
          created_by: this.userId(user),
        },
      });
      await tx.residential_units.update({ where: { id: flatId }, data: { status: 'filled' } });
      await tx.workers.update({ where: { id: workerId }, data: { status: 'active' } });
      if (applicationId) {
        await tx.worker_applications.update({
          where: { id: applicationId },
          data: { status: 'flat_assigned', current_flat_assignment_id: assignment.id },
        });
      }

      // Tell the colony's caretaker to hand over the flat, and let the industry
      // see that their worker has been allotted a flat.
      const flat = await tx.residential_units.findUnique({ where: { id: flatId }, select: { colony_id: true, flat_no: true } });
      const worker = await tx.workers.findUnique({ where: { id: workerId }, select: { name: true } });
      const workerName = worker?.name ?? `Worker #${workerId}`;
      const flatLabel = flat?.flat_no ?? String(flatId);

      if (flat?.colony_id) {
        const caretakers = await tx.caretaker_colonies.findMany({
          where: { colony_id: flat.colony_id, is_active: true, users: { status: 'active' } },
          select: { user_id: true },
        });
        if (caretakers.length) {
          await tx.notifications.createMany({
            data: caretakers.map((caretaker) => ({
              recipient_type: 'user',
              recipient_id: caretaker.user_id,
              application_id: applicationId,
              title: 'Flat handover required',
              message: `Flat ${flatLabel} in your colony has been allotted to ${workerName} by the committee. Please hand over possession.`,
              notification_type: 'flat_assigned_caretaker',
              status: 'sent',
              sent_at: new Date(),
            })),
          });
        }
      }

      if (applicationId) {
        const application = await tx.worker_applications.findUnique({
          where: { id: applicationId },
          include: { industries: { include: { industry_users: true } } },
        });
        const industryUsers = application?.industries?.industry_users ?? [];
        if (industryUsers.length) {
          await tx.notifications.createMany({
            data: industryUsers.map((industryUser) => ({
              recipient_type: 'user',
              recipient_id: industryUser.user_id,
              application_id: applicationId,
              title: 'Flat assigned to your worker',
              message: `${workerName} has been allotted flat ${flatLabel}. The colony caretaker will arrange possession.`,
              notification_type: 'flat_assigned_industry',
              status: 'sent',
              sent_at: new Date(),
            })),
          });
        }
      }
      return assignment;
    });
    return response('Flat assigned successfully', created);
  }

  async vacateFlat(id: string, body: unknown) {
    const data = coerceData(body);
    const assignment = await this.prisma.$transaction(async (tx) => {
      const current = await tx.flat_assignments.update({
        where: { id: parseId(id) },
        data: {
          status: 'vacated',
          end_date: data.end_date ? (data.end_date as Date) : new Date(),
          vacated_reason: data.vacated_reason as string | undefined,
          remarks: data.remarks as string | undefined,
        },
      });
      await tx.residential_units.update({ where: { id: current.flat_id }, data: { status: 'empty' } });
      return current;
    });
    return response('Flat vacated successfully', assignment);
  }

  async transferFlat(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const newFlatId = Number(data.new_flat_id);
    if (!newFlatId) throw new BadRequestException('new_flat_id is required');
    const assignment = await this.prisma.$transaction(async (tx) => {
      const old = await tx.flat_assignments.update({
        where: { id: parseId(id) },
        data: { status: 'transferred', end_date: data.start_date ? (data.start_date as Date) : new Date(), remarks: data.remarks as string | undefined },
      });
      await tx.residential_units.update({ where: { id: old.flat_id }, data: { status: 'empty' } });
      const created = await tx.flat_assignments.create({
        data: {
          worker_id: old.worker_id,
          flat_id: newFlatId,
          application_id: data.application_id ? Number(data.application_id) : old.application_id,
          start_date: data.start_date ? (data.start_date as Date) : new Date(),
          remarks: data.remarks as string | undefined,
          created_by: this.userId(user),
        },
      });
      await tx.residential_units.update({ where: { id: newFlatId }, data: { status: 'filled' } });
      return created;
    });
    return response('Flat transferred successfully', assignment);
  }

  async cancelFlatAssignment(id: string) {
    const assignment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.flat_assignments.update({ where: { id: parseId(id) }, data: { status: 'cancelled' } });
      await tx.residential_units.update({ where: { id: updated.flat_id }, data: { status: 'empty' } });
      return updated;
    });
    return response('Flat assignment cancelled successfully', assignment);
  }

  async activeFlatAssignments(query: Record<string, unknown>) {
    return this.list('flat-assignments', { ...query, status: 'active' });
  }

  async flatAssignmentHistory(query: Record<string, unknown>) {
    return this.list('flat-assignments', query);
  }

  // Normalises any date to the first day of its month (UTC) so "June" always
  // maps to a single billing_month value, no matter which day was picked. This
  // is what makes the (flat_assignment_id, billing_month) unique key actually
  // guarantee one invoice per worker per month.
  private monthStart(value?: Date): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  async generateRentInvoices(body: unknown, user?: AuthUser) {
    // Generating (and regenerating) rent vouchers is the accountant's job.
    this.requireRole(user, 'generate rent invoices', ROLES.financeWing, ROLES.recoveriesRent, ROLES.directorAdmin);
    const data = coerceData(body);
    const billingMonth = this.monthStart(data.billing_month as Date);
    if (!billingMonth) throw new BadRequestException('billing_month is required');
    const dueDate = (data.due_date as Date) ?? new Date(Date.UTC(billingMonth.getUTCFullYear(), billingMonth.getUTCMonth(), 10));
    // Regeneration is an explicit, accountant-confirmed action and only ever
    // refreshes invoices that have not been paid at all.
    const force = data.force === true || data.force === 'true';

    const assignments = await this.prisma.flat_assignments.findMany({
      where: {
        status: 'active',
        ...(data.colony_id ? { residential_units: { colony_id: Number(data.colony_id) } } : {}),
      },
      include: { workers: true, residential_units: true },
    });

    let createdCount = 0;
    let skippedCount = 0;
    let regeneratedCount = 0;
    const colonyInvoiceCount = new Map<number, number>();

    await this.prisma.$transaction(async (tx) => {
      const resolveAmount = async (assignment: (typeof assignments)[number]) => {
        let rate = await tx.rent_rates.findFirst({
          where: {
            flat_id: assignment.flat_id,
            effective_from: { lte: billingMonth },
            OR: [{ effective_to: null }, { effective_to: { gte: billingMonth } }],
          },
          orderBy: { id: 'desc' },
        });
        if (!rate) {
          rate = await tx.rent_rates.findFirst({
            where: {
              AND: [
                {
                  OR: [
                    { colony_id: assignment.residential_units.colony_id, unit_type: String(assignment.residential_units.flat_rooms ?? '') },
                    { colony_id: assignment.residential_units.colony_id, unit_type: null },
                    { colony_id: null },
                  ],
                },
                { effective_from: { lte: billingMonth } },
                { OR: [{ effective_to: null }, { effective_to: { gte: billingMonth } }] },
              ],
            },
            orderBy: { id: 'desc' },
          });
        }
        const amount = assignment.rent_amount && assignment.rent_amount > BigInt(0) ? assignment.rent_amount : rate?.amount ?? BigInt(0);
        return { amount, rateId: rate?.id };
      };

      for (const assignment of assignments) {
        const existing = await tx.rent_invoices.findFirst({
          where: { flat_assignment_id: assignment.id, billing_month: billingMonth },
        });

        if (existing) {
          // Already generated: never silently re-create. Only the accountant's
          // explicit force refreshes it, and only while it is still untouched.
          if (!force || existing.paid_amount > BigInt(0) || ['paid', 'partial', 'cancelled'].includes(existing.status)) {
            skippedCount += 1;
            continue;
          }
          const { amount, rateId } = await resolveAmount(assignment);
          await tx.rent_invoices.update({
            where: { id: existing.id },
            data: { rent_amount: amount, total_amount: amount + existing.late_fee_amount, due_date: dueDate, rent_rate_id: rateId },
          });
          regeneratedCount += 1;
          continue;
        }

        const { amount, rateId } = await resolveAmount(assignment);
        const paymentMode = assignment.workers.worker_type === 'welfare_board' ? 'salary_deduction' : 'manual';
        await tx.rent_invoices.create({
          data: {
            flat_assignment_id: assignment.id,
            worker_id: assignment.worker_id,
            billing_month: billingMonth,
            due_date: dueDate,
            rent_rate_id: rateId,
            rent_amount: amount,
            total_amount: amount,
            payment_mode: paymentMode,
            deduction_status: paymentMode === 'salary_deduction' ? 'pending' : 'not_required',
          },
        });
        createdCount += 1;
        const colonyId = assignment.residential_units.colony_id;
        if (colonyId) colonyInvoiceCount.set(colonyId, (colonyInvoiceCount.get(colonyId) ?? 0) + 1);
      }

      // Notify caretakers only about genuinely new vouchers (never on a re-run).
      if (colonyInvoiceCount.size) {
        const month = billingMonth.toISOString().slice(0, 7);
        const caretakerColonies = await tx.caretaker_colonies.findMany({
          where: { colony_id: { in: [...colonyInvoiceCount.keys()] }, is_active: true, users: { status: 'active' } },
          select: { user_id: true, colony_id: true },
        });
        if (caretakerColonies.length) {
          await tx.notifications.createMany({
            data: caretakerColonies.map((link) => ({
              recipient_type: 'user',
              recipient_id: link.user_id,
              title: 'Monthly rent vouchers ready',
              message: `${colonyInvoiceCount.get(link.colony_id) ?? 0} rent voucher(s) for ${month} are ready for collection in your colony.`,
              notification_type: 'rent_vouchers_generated',
              status: 'sent',
              sent_at: new Date(),
            })),
          });
        }
      }
    });

    const monthLabel = billingMonth.toISOString().slice(0, 7);
    const message =
      createdCount > 0
        ? `${createdCount} rent invoice(s) generated for ${monthLabel}${skippedCount ? ` (${skippedCount} already existed)` : ''}.`
        : regeneratedCount > 0
          ? `${regeneratedCount} unpaid rent invoice(s) regenerated for ${monthLabel}.`
          : `Rent invoices for ${monthLabel} are already generated. Nothing to create.`;

    return response(message, {
      billing_month: billingMonth.toISOString().slice(0, 10),
      created: createdCount,
      skipped: skippedCount,
      regenerated: regeneratedCount,
      already_generated: createdCount === 0 && regeneratedCount === 0,
    });
  }

  async applyLateFee(id: string) {
    const invoice = await this.prisma.rent_invoices.findUnique({ where: { id: parseId(id) } });
    if (!invoice) throw new NotFoundException('Rent invoice not found');
    const rule = await this.prisma.late_fee_rules.findFirst({
      where: { is_active: true, effective_from: { lte: invoice.billing_month }, OR: [{ effective_to: null }, { effective_to: { gte: invoice.billing_month } }] },
      orderBy: { id: 'desc' },
    });
    if (!rule) return response('No active late fee rule found', invoice);
    const today = new Date();
    const graceDue = new Date(invoice.due_date);
    graceDue.setDate(graceDue.getDate() + rule.grace_days);
    if (today <= graceDue) return response('Invoice is still within grace period', invoice);
    const daysLate = Math.max(Math.ceil((today.getTime() - graceDue.getTime()) / 86400000), 1);
    let lateFee = rule.fee_type === 'fixed' ? rule.amount : rule.fee_type === 'percentage' ? (invoice.rent_amount * rule.amount) / BigInt(100) : rule.amount * BigInt(daysLate);
    if (rule.max_fee_amount && lateFee > rule.max_fee_amount) lateFee = rule.max_fee_amount;
    const updated = await this.prisma.$transaction((tx) =>
      tx.rent_invoices.update({
        where: { id: invoice.id },
        data: {
          late_fee_rule_id: rule.id,
          late_fee_amount: lateFee,
          total_amount: invoice.rent_amount + lateFee,
          status: 'overdue',
        },
      }),
    );
    return response('Late fee applied successfully', updated);
  }

  async cancelRentInvoice(id: string) {
    const invoice = await this.prisma.$transaction((tx) =>
      tx.rent_invoices.update({ where: { id: parseId(id) }, data: { status: 'cancelled' } }),
    );
    return response('Rent invoice cancelled successfully', invoice);
  }

  // --- Rent collection routing & remittance --------------------------------
  // Post a caretaker to a colony so that colony's rent vouchers/payments route
  // to them. Re-assigning an existing pair just (re)activates it.
  async assignCaretakerToColony(body: unknown, user?: AuthUser) {
    this.requireRole(user, 'assign a caretaker to a colony', ...AD_COLONIES_ROLES, ROLES.colonySection, ROLES.directorAdmin);
    const data = coerceData(body);
    const caretakerId = Number(data.user_id ?? data.caretaker_user_id);
    const colonyId = Number(data.colony_id);
    if (!caretakerId || !colonyId) throw new BadRequestException('user_id (caretaker) and colony_id are required');
    const caretaker = await this.prisma.users.findUnique({ where: { id: caretakerId } });
    if (!caretaker) throw new NotFoundException('Caretaker user not found');
    if (caretaker.role !== ROLES.careTakerLabourColony) {
      throw new BadRequestException('Selected user is not a labour-colony caretaker');
    }
    const link = await this.prisma.caretaker_colonies.upsert({
      where: { user_id_colony_id: { user_id: caretakerId, colony_id: colonyId } },
      create: { user_id: caretakerId, colony_id: colonyId },
      update: { is_active: data.is_active === undefined ? true : Boolean(data.is_active) },
    });
    return response('Caretaker assigned to colony successfully', link);
  }

  // Caretaker view: the rent they have collected but not yet handed to the
  // accountant, with the running total.
  async myPendingRentCollection(user?: AuthUser) {
    const caretakerId = this.userId(user);
    if (!caretakerId) throw new BadRequestException('Authenticated caretaker is required');
    const where = { collected_user_id: caretakerId, remittance_id: null };
    const [items, agg] = await Promise.all([
      this.prisma.rent_payments.findMany({ where, orderBy: { id: 'desc' } }),
      this.prisma.rent_payments.aggregate({ where, _sum: { amount: true }, _count: { _all: true } }),
    ]);
    return response('Pending rent collection fetched successfully', items, {
      pending_amount: (agg._sum.amount ?? BigInt(0)).toString(),
      payment_count: agg._count._all,
    });
  }

  // Accountant view: how much each caretaker is holding. Pass remitted=true to
  // see lifetime totals instead of only the un-remitted (pending) cash.
  async caretakerCollectionSummary(query: Record<string, unknown>) {
    const includeRemitted = query.remitted === true || query.remitted === 'true';
    const grouped = await this.prisma.rent_payments.groupBy({
      by: ['collected_user_id'],
      where: {
        collected_user_id: { not: null },
        ...(includeRemitted ? {} : { remittance_id: null }),
      },
      _sum: { amount: true },
      _count: { _all: true },
    });
    const userIds = grouped
      .map((group) => group.collected_user_id)
      .filter((id): id is number => id !== null);
    const users = userIds.length
      ? await this.prisma.users.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));
    const summary = grouped.map((group) => ({
      caretaker_user_id: group.collected_user_id,
      caretaker: group.collected_user_id ? userMap.get(group.collected_user_id) ?? null : null,
      amount: (group._sum.amount ?? BigInt(0)).toString(),
      payment_count: group._count._all,
      basis: includeRemitted ? 'all' : 'pending',
    }));
    return response('Caretaker collection summary fetched successfully', summary);
  }

  // Optional ?billing_month=YYYY-MM filter, normalised to the 1st of the month.
  private invoiceMonthWhere(query: Record<string, unknown>): Record<string, unknown> {
    const month = query.billing_month ? this.monthStart(new Date(String(query.billing_month))) : undefined;
    return month ? { billing_month: month } : {};
  }

  // Accountant drill-down: billed / collected / outstanding per worker.
  async rentCollectionByWorker(query: Record<string, unknown>) {
    const where = this.invoiceMonthWhere(query);
    const grouped = await this.prisma.rent_invoices.groupBy({
      by: ['worker_id'],
      where,
      _sum: { total_amount: true, paid_amount: true },
      _count: { _all: true },
    });
    const workerIds = grouped.map((group) => group.worker_id);
    const workers = workerIds.length
      ? await this.prisma.workers.findMany({ where: { id: { in: workerIds } }, select: { id: true, name: true, cnic: true } })
      : [];
    const workerMap = new Map(workers.map((worker) => [worker.id, worker]));
    const rows = grouped
      .map((group) => {
        const billed = group._sum.total_amount ?? BigInt(0);
        const collected = group._sum.paid_amount ?? BigInt(0);
        return {
          worker_id: group.worker_id,
          worker: workerMap.get(group.worker_id) ?? null,
          billed: billed.toString(),
          collected: collected.toString(),
          outstanding: (billed - collected).toString(),
          invoice_count: group._count._all,
        };
      })
      .sort((a, b) => Number(BigInt(b.collected) - BigInt(a.collected)));
    return response('Rent collection by worker fetched successfully', rows);
  }

  // Accountant drill-down: billed / collected / outstanding per colony.
  async rentCollectionByColony(query: Record<string, unknown>) {
    const where = this.invoiceMonthWhere(query);
    const invoices = await this.prisma.rent_invoices.findMany({
      where,
      select: {
        total_amount: true,
        paid_amount: true,
        flat_assignments: { select: { residential_units: { select: { colony_id: true } } } },
      },
    });
    const agg = new Map<number, { billed: bigint; collected: bigint; count: number }>();
    for (const invoice of invoices) {
      const colonyId = invoice.flat_assignments?.residential_units?.colony_id ?? 0;
      const current = agg.get(colonyId) ?? { billed: BigInt(0), collected: BigInt(0), count: 0 };
      current.billed += invoice.total_amount;
      current.collected += invoice.paid_amount;
      current.count += 1;
      agg.set(colonyId, current);
    }
    const colonyIds = [...agg.keys()].filter((id) => id > 0);
    const colonies = colonyIds.length
      ? await this.prisma.colonies.findMany({ where: { id: { in: colonyIds } }, select: { id: true, name: true } })
      : [];
    const colonyMap = new Map(colonies.map((colony) => [colony.id, colony]));
    const rows = [...agg.entries()]
      .map(([colonyId, value]) => ({
        colony_id: colonyId || null,
        colony: colonyId ? colonyMap.get(colonyId) ?? null : null,
        billed: value.billed.toString(),
        collected: value.collected.toString(),
        outstanding: (value.billed - value.collected).toString(),
        invoice_count: value.count,
      }))
      .sort((a, b) => Number(BigInt(b.collected) - BigInt(a.collected)));
    return response('Rent collection by colony fetched successfully', rows);
  }

  // Accountant collects the cash a caretaker is holding: bundle their
  // un-remitted payments into one remittance and stamp them as handed over.
  async collectRentRemittance(body: unknown, user?: AuthUser) {
    this.requireRole(user, 'collect a rent remittance', ROLES.financeWing, ROLES.recoveriesRent, ROLES.directorAdmin);
    const data = coerceData(body);
    const caretakerId = Number(data.caretaker_user_id ?? data.user_id);
    if (!caretakerId) throw new BadRequestException('caretaker_user_id is required');
    const paymentIds = Array.isArray(data.payment_ids)
      ? (data.payment_ids as unknown[]).map((value) => Number(value)).filter((value) => Number.isInteger(value))
      : undefined;
    const remittance = await this.prisma.$transaction(async (tx) => {
      const payments = await tx.rent_payments.findMany({
        where: {
          collected_user_id: caretakerId,
          remittance_id: null,
          ...(paymentIds?.length ? { id: { in: paymentIds } } : {}),
        },
        select: { id: true, amount: true },
      });
      if (!payments.length) throw new BadRequestException('This caretaker has no un-remitted rent payments to collect');
      const total = payments.reduce((sum, payment) => sum + payment.amount, BigInt(0));
      const created = await tx.rent_remittances.create({
        data: {
          caretaker_user_id: caretakerId,
          received_by_user_id: this.userId(user),
          total_amount: total,
          payment_count: payments.length,
          status: 'received',
          received_at: new Date(),
          remarks: data.remarks as string | undefined,
        },
      });
      await tx.rent_payments.updateMany({
        where: { id: { in: payments.map((payment) => payment.id) } },
        data: { remittance_id: created.id },
      });
      await tx.notifications.create({
        data: {
          recipient_type: 'user',
          recipient_id: caretakerId,
          title: 'Rent collection received',
          message: `The accountant collected ${payments.length} rent payment(s) totalling ${total.toString()} from you.`,
          notification_type: 'rent_remittance_received',
          status: 'sent',
          sent_at: new Date(),
        },
      });
      return created;
    });
    return response('Rent remittance collected successfully', remittance);
  }

  async payRentInvoice(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const amount = BigInt(String(data.amount ?? 0));
    if (amount <= BigInt(0)) throw new BadRequestException('amount must be greater than zero');
    const paid = await this.prisma.$transaction(async (tx) => {
      const invoice = await tx.rent_invoices.findUnique({ where: { id: parseId(id) } });
      if (!invoice) throw new NotFoundException('Rent invoice not found');
      if (['paid', 'cancelled'].includes(invoice.status)) {
        throw new BadRequestException('This rent invoice is not collectible');
      }
      const balance = invoice.total_amount - invoice.paid_amount;
      if (amount > balance) {
        throw new BadRequestException('amount cannot be greater than invoice balance');
      }
      const payment = await tx.rent_payments.create({
        data: {
          rent_invoice_id: parseId(id),
          amount,
          payment_date: (data.payment_date as Date) ?? new Date(),
          collected_user_id: this.userId(user),
          payment_method: data.payment_method as string | undefined,
          receipt_no: data.receipt_no as string | undefined,
          remarks: data.remarks as string | undefined,
        },
      });
      const paidAmount = invoice.paid_amount + amount;
      await tx.rent_invoices.update({
        where: { id: invoice.id },
        data: {
          paid_amount: paidAmount,
          status: paidAmount >= invoice.total_amount ? 'paid' : 'partial',
        },
      });
      return payment;
    });
    return response('Rent payment recorded successfully', paid);
  }

  async payUtilityBill(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const amount = BigInt(String(data.amount ?? 0));
    if (amount <= BigInt(0)) throw new BadRequestException('amount must be greater than zero');
    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.utility_payments.create({
        data: {
          utility_bill_id: parseId(id),
          amount,
          payment_date: (data.payment_date as Date) ?? new Date(),
          collected_by_user_id: this.userId(user),
          created_by: this.userId(user),
          receipt_no: data.receipt_no as string | undefined,
        },
      });
      const totalPaid = await tx.utility_payments.aggregate({
        where: { utility_bill_id: parseId(id) },
        _sum: { amount: true },
      });
      const bill = await tx.utility_bills.findUnique({ where: { id: parseId(id) } });
      if (!bill) throw new NotFoundException('Utility bill not found');
      await tx.utility_bills.update({
        where: { id: bill.id },
        data: { status: (totalPaid._sum.amount ?? BigInt(0)) >= bill.amount ? 'paid' : 'partial' },
      });
      return created;
    });
    return response('Utility payment recorded successfully', payment);
  }

  async fetchUtilityBill(body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const connectionId = Number(data.utility_connection_id);
    const billingMonth = data.billing_month as Date;
    if (!connectionId || !billingMonth) throw new BadRequestException('utility_connection_id and billing_month are required');
    const result = await this.prisma.$transaction(async (tx) => {
      const connection = await tx.utility_connections.findUnique({ where: { id: connectionId }, include: { residential_units: true } });
      if (!connection) throw new NotFoundException('Utility connection not found');
      const assignment = await tx.flat_assignments.findFirst({ where: { flat_id: connection.flat_id, status: 'active' } });
      const bill = await tx.utility_bills.upsert({
        where: { utility_connection_id_billing_month: { utility_connection_id: connectionId, billing_month: billingMonth } },
        create: {
          utility_connection_id: connectionId,
          flat_assignment_id: assignment?.id,
          worker_id: assignment?.worker_id,
          flat_id: connection.flat_id,
          utility_type: connection.utility_type,
          billing_month: billingMonth,
          amount: BigInt(String(data.amount ?? 0)),
          due_date: (data.due_date as Date) ?? null,
          status: data.amount ? 'unpaid' : 'not_generated',
          created_by: this.userId(user),
        },
        update: {},
      });
      await tx.utility_bill_fetch_attempts.create({
        data: {
          utility_connection_id: connectionId,
          billing_month: billingMonth,
          status: data.amount ? 'found' : 'not_generated',
          api_response_code: data.amount ? '200' : '404',
        },
      });
      return bill;
    });
    return response('Utility bill fetch processed successfully', result);
  }

  async fetchMonthlyUtilityBills(body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const billingMonth = data.billing_month as Date;
    if (!billingMonth) throw new BadRequestException('billing_month is required');
    const connections = await this.prisma.utility_connections.findMany({
      where: { is_active: true, ...(data.utility_type ? { utility_type: data.utility_type as never } : {}) },
    });
    const processed: unknown[] = [];
    await this.prisma.$transaction(async (tx) => {
      for (const connection of connections) {
        const assignment = await tx.flat_assignments.findFirst({ where: { flat_id: connection.flat_id, status: 'active' } });
        const bill = await tx.utility_bills.upsert({
          where: { utility_connection_id_billing_month: { utility_connection_id: connection.id, billing_month: billingMonth } },
          create: {
            utility_connection_id: connection.id,
            flat_assignment_id: assignment?.id,
            worker_id: assignment?.worker_id,
            flat_id: connection.flat_id,
            utility_type: connection.utility_type,
            billing_month: billingMonth,
            amount: BigInt(0),
            status: 'not_generated',
            created_by: this.userId(user),
          },
          update: {},
        });
        await tx.utility_bill_fetch_attempts.create({
          data: { utility_connection_id: connection.id, billing_month: billingMonth, status: 'not_generated', api_response_code: '404' },
        });
        processed.push(bill);
      }
    });
    return response('Monthly utility fetch processed successfully', processed, { count: processed.length });
  }

  async verifyDocument(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const document = await this.prisma.$transaction((tx) =>
      tx.documents.update({
        where: { id: parseId(id) },
        data: {
          status: 'approved',
          verified_by: this.userId(user),
          verified_at: new Date(),
          remarks: data.remarks as string | undefined,
        },
      }),
    );
    return response('Document verified successfully', document);
  }

  async uploadDocumentFile(file: UploadedDocumentFile | undefined, body: unknown, user?: AuthUser) {
    if (!file) throw new BadRequestException('file is required');
    const data = coerceData(body);
    const documentTypeId = Number(data.document_type_id);
    if (!documentTypeId) throw new BadRequestException('document_type_id is required');
    const documentType = await this.prisma.document_types.findUnique({ where: { id: documentTypeId } });
    if (!documentType) throw new NotFoundException('Document type not found');

    const allowed = documentType.allowed_file_type.split(',').map((item) => item.trim().toLowerCase());
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (!allowed.includes(ext)) {
      throw new BadRequestException(`File type .${ext} is not allowed for ${documentType.code}`);
    }
    const maxBytes = documentType.max_file_size_mb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(`File size exceeds ${documentType.max_file_size_mb}MB`);
    }

    const document = await this.prisma.$transaction((tx) =>
      tx.documents.create({
        data: {
          document_type_id: documentTypeId,
          owner_type: (data.owner_type ?? 'worker') as never,
          owner_id: data.owner_id ? Number(data.owner_id) : undefined,
          application_id: data.application_id ? Number(data.application_id) : undefined,
          file_path: file.path,
          original_file_name: file.originalname,
          mime_type: file.mimetype,
          file_size: BigInt(file.size),
          visibility: (data.visibility ?? documentType.default_visibility) as never,
          remarks: data.remarks as string | undefined,
          uploaded_by: this.userId(user),
        },
      }),
    );
    return response('Document uploaded successfully', document);
  }

  async rejectDocument(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const document = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.documents.update({
        where: { id: parseId(id) },
        data: {
          status: 'rejected',
          verified_by: this.userId(user),
          verified_at: new Date(),
          rejection_reason: data.rejection_reason as string | undefined,
        },
      });
      if (updated.application_id) {
        const application = await tx.worker_applications.findUnique({
          where: { id: updated.application_id },
          include: { workers: true, industries: { include: { industry_users: true } } },
        });
        const industryUsers = application?.industries?.industry_users ?? [];
        if (industryUsers.length) {
          await tx.notifications.createMany({
            data: industryUsers.map((industryUser) => ({
              recipient_type: 'user',
              recipient_id: industryUser.user_id,
              application_id: updated.application_id,
              title: 'Document Rejected',
              message: `${updated.original_file_name} was rejected for ${application?.workers.name ?? 'worker'}. Please reupload this file.`,
              notification_type: 'document_rejected',
              status: 'sent',
              sent_at: new Date(),
            })),
          });
        }
      }
      return updated;
    });
    return response('Document rejected successfully', document);
  }

  async updateDocumentVisibility(id: string, body: unknown) {
    const data = coerceData(body);
    if (!data.visibility) throw new BadRequestException('visibility is required');
    const document = await this.prisma.$transaction((tx) =>
      tx.documents.update({ where: { id: parseId(id) }, data: { visibility: data.visibility as never } }),
    );
    return response('Document visibility updated successfully', document);
  }

  async downloadDocument(id: string) {
    const document = await this.prisma.documents.findUnique({ where: { id: parseId(id) } });
    if (!document) throw new NotFoundException('Document not found');
    const filePath = resolve(document.file_path);
    if (!existsSync(filePath)) throw new NotFoundException('Document file not found on server');
    return {
      id: document.id,
      file_path: filePath,
      original_file_name: document.original_file_name,
      mime_type: document.mime_type,
    };
  }

  async logUtilityFetch(body: unknown) {
    const data = coerceData(body);
    const attempt = await this.prisma.utility_bill_fetch_attempts.create({ data: data as never });
    return response('Utility fetch attempt logged successfully', attempt);
  }

  async assignComplaint(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const caretakerId = Number(data.assigned_caretaker_id ?? data.assigned_to_user_id);
    if (!caretakerId) throw new BadRequestException('assigned_caretaker_id is required');
    const complaint = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.complaints.update({
        where: { id: parseId(id) },
        data: { assigned_caretaker_id: caretakerId, status: 'assigned' },
      });
      await tx.caretaker_tasks.create({
        data: {
          asset_id: data.asset_id ? Number(data.asset_id) : undefined,
          complaint_id: updated.id,
          flat_id: updated.flat_id,
          assigned_to_user_id: caretakerId,
          assigned_by_user_id: this.userId(user),
          task_title: (data.task_title as string) ?? `Complaint #${updated.id}`,
          task_description: updated.complaint_desc,
          target_latitude: data.target_latitude as never,
          target_longitude: data.target_longitude as never,
          allowed_radius_meters: data.allowed_radius_meters ? Number(data.allowed_radius_meters) : undefined,
          due_at: data.due_at as Date | undefined,
        },
      });
      return updated;
    });
    return response('Complaint assigned successfully', complaint);
  }

  async setComplaintStatus(id: string, status: 'in_progress' | 'resolved' | 'closed' | 'reopened') {
    const mapped = status === 'reopened' ? 'reopened' : status;
    const complaint = await this.prisma.$transaction((tx) =>
      tx.complaints.update({ where: { id: parseId(id) }, data: { status: mapped } }),
    );
    return response(`Complaint ${status} successfully`, complaint);
  }

  // The caretaker verifies the work is done by uploading a proof image while
  // standing at the complaint's pinned location. The current GPS must be within
  // the complaint's allowed radius of where the issue was reported.
  async resolveComplaintWithProof(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const complaint = await this.prisma.complaints.findUnique({ where: { id: parseId(id) } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const imageId = data.image_document_id ? Number(data.image_document_id) : undefined;
    if (!imageId) throw new BadRequestException('A verification image is required to confirm the work is done');

    const hasComplaintLocation = complaint.latitude != null && complaint.longitude != null;
    const hasCurrentLocation = data.latitude !== undefined && data.longitude !== undefined;
    let distance: number | undefined;

    if (hasComplaintLocation) {
      if (!hasCurrentLocation) {
        throw new BadRequestException('Your current location is required — verification must be done at the complaint site');
      }
      distance = distanceMeters(
        Number(data.latitude),
        Number(data.longitude),
        Number(complaint.latitude),
        Number(complaint.longitude),
      );
      const radius = complaint.allowed_radius_meters ?? 100;
      if (distance > radius) {
        throw new BadRequestException(`You are ${Math.round(distance)} meters away from the complaint location. Verification is only allowed within ${radius} meters of the site.`);
      }
    }

    const updated = await this.prisma.$transaction((tx) =>
      tx.complaints.update({
        where: { id: complaint.id },
        data: {
          status: 'resolved',
          resolved_image_id: imageId,
          resolved_latitude: hasCurrentLocation ? (data.latitude as never) : undefined,
          resolved_longitude: hasCurrentLocation ? (data.longitude as never) : undefined,
          resolved_distance_meters: distance as never,
          resolved_by: this.userId(user),
          resolved_at: new Date(),
          resolution_remarks: data.resolution_remarks as string | undefined,
        },
      }),
    );
    return response('Complaint verified and resolved successfully', updated);
  }

  async createAssetStatus(id: string, body: unknown) {
    const data = coerceData(body);
    const history = await this.prisma.$transaction(async (tx) => {
      const created = await tx.asset_status_history.create({
        data: {
          asset_id: parseId(id),
          status: data.status as never,
          repaired_image_id: data.repaired_image_id ? Number(data.repaired_image_id) : undefined,
        },
      });
      return created;
    });
    return response('Asset status saved successfully', history);
  }

  async attendanceLogin(body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const userId = Number(data.user_id ?? this.userId(user));
    if (!userId) throw new BadRequestException('user_id is required');
    const attendance = await this.prisma.caretaker_attendance.create({
      data: {
        user_id: userId,
        duty_date: (data.duty_date as Date) ?? new Date(),
        login_latitude: (data.login_latitude ?? data.latitude) as never,
        login_longitude: (data.login_longitude ?? data.longitude) as never,
      },
    });
    return response('Caretaker attendance started successfully', attendance);
  }

  async attendanceLogout(id: string, body: unknown) {
    const data = coerceData(body);
    const attendance = await this.prisma.caretaker_attendance.update({
      where: { id: parseId(id) },
      data: {
        logout_time: new Date(),
        logout_latitude: data.logout_latitude as never,
        logout_longitude: data.logout_longitude as never,
        status: 'completed',
      },
    });
    return response('Caretaker attendance completed successfully', attendance);
  }

  async attendanceLogoutByBody(body: unknown) {
    const data = coerceData(body);
    if (!data.attendance_id) throw new BadRequestException('attendance_id is required');
    return this.attendanceLogout(String(data.attendance_id), {
      logout_latitude: data.logout_latitude ?? data.latitude,
      logout_longitude: data.logout_longitude ?? data.longitude,
    });
  }

  async gpsPing(body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const userId = Number(data.user_id ?? this.userId(user));
    if (!userId || data.latitude === undefined || data.longitude === undefined) {
      throw new BadRequestException('user_id, latitude and longitude are required');
    }
    const ping = await this.prisma.caretaker_gps_tracking.create({
      data: {
        user_id: userId,
        attendance_id: data.attendance_id ? Number(data.attendance_id) : undefined,
        latitude: data.latitude as never,
        longitude: data.longitude as never,
        accuracy: data.accuracy as never,
        battery_level: data.battery_level ? Number(data.battery_level) : undefined,
        is_mock_location: Boolean(data.is_mock_location ?? false),
      },
    });
    return response('GPS ping saved successfully', ping);
  }

  async setTaskStatus(id: string, status: 'accepted' | 'in_progress' | 'completed' | 'rejected') {
    const task = await this.prisma.$transaction((tx) =>
      tx.caretaker_tasks.update({ where: { id: parseId(id) }, data: { status } }),
    );
    return response(`Task ${status} successfully`, task);
  }

  async uploadTaskProof(id: string, body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const task = await this.prisma.caretaker_tasks.findUnique({ where: { id: parseId(id) } });
    if (!task) throw new NotFoundException('Task not found');
    let distance: number | undefined;
    let within = false;
    if (task.target_latitude && task.target_longitude && data.latitude !== undefined && data.longitude !== undefined) {
      distance = distanceMeters(Number(data.latitude), Number(data.longitude), Number(task.target_latitude), Number(task.target_longitude));
      within = distance <= Number(task.allowed_radius_meters ?? 100);
      if (!within) {
        throw new BadRequestException(`You are ${Math.round(distance)} meters away from the task location. Proof can only be submitted within ${task.allowed_radius_meters ?? 100} meters.`);
      }
    }
    if ((task.target_latitude || task.target_longitude) && (data.latitude === undefined || data.longitude === undefined)) {
      throw new BadRequestException('Current latitude and longitude are required for this task proof');
    }
    if (!data.image_document_id) {
      throw new BadRequestException('image_document_id is required');
    }
    const proof = await this.prisma.$transaction(async (tx) => {
      const created = await tx.task_proofs.create({
        data: {
          task_id: task.id,
          uploaded_by_user_id: this.userId(user),
          image_document_id: data.image_document_id ? Number(data.image_document_id) : undefined,
          latitude: data.latitude as never,
          longitude: data.longitude as never,
          accuracy: data.accuracy as never,
          distance_from_target_meters: distance as never,
          is_within_allowed_radius: within,
          remarks: data.remarks as string | undefined,
        },
      });
      await tx.caretaker_tasks.update({
        where: { id: task.id },
        data: { status: 'completed' },
      });
      if (task.asset_id) {
        await tx.asset_status_history.create({
          data: {
            asset_id: task.asset_id,
            status: 'repaired',
            repaired_image_id: Number(data.image_document_id),
          },
        });
      }
      return created;
    });
    return response('Task proof uploaded successfully', proof);
  }

  async createTaskProof(data: Record<string, unknown>, user?: AuthUser) {
    if (!data.task_id) throw new BadRequestException('task_id is required');
    return this.uploadTaskProof(String(data.task_id), data, user);
  }

  async approveTaskProof(id: string) {
    const proof = await this.prisma.task_proofs.findUnique({ where: { id: parseId(id) } });
    if (!proof) throw new NotFoundException('Task proof not found');
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.caretaker_tasks.update({ where: { id: proof.task_id }, data: { status: 'completed' } });
      return proof;
    });
    return response('Task proof approved successfully', updated);
  }

  async rejectTaskProof(id: string) {
    const proof = await this.prisma.task_proofs.findUnique({ where: { id: parseId(id) } });
    if (!proof) throw new NotFoundException('Task proof not found');
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.caretaker_tasks.update({ where: { id: proof.task_id }, data: { status: 'rejected' } });
      return proof;
    });
    return response('Task proof rejected successfully', updated);
  }

  async markNotificationRead(id: string) {
    const notification = await this.prisma.$transaction((tx) =>
      tx.notifications.update({ where: { id: parseId(id) }, data: { status: 'read', read_at: new Date() } }),
    );
    return response('Notification marked as read successfully', notification);
  }

  async markAllNotificationsRead(user?: AuthUser) {
    const updated = await this.prisma.$transaction((tx) =>
      tx.notifications.updateMany({
        where: { recipient_type: 'user', recipient_id: this.userId(user) ?? 0, status: { not: 'read' } },
        data: { status: 'read', read_at: new Date() },
      }),
    );
    return response('Notifications marked as read successfully', updated);
  }

  async dashboard(name: string, user?: AuthUser) {
    const [workers, applications, flats, complaints, rentUnpaid, utilityUnpaid, tasks] = await Promise.all([
      this.prisma.workers.count(),
      this.prisma.worker_applications.count(),
      this.prisma.residential_units.count(),
      this.prisma.complaints.count(),
      this.prisma.rent_invoices.count({ where: { status: { in: ['unpaid', 'partial', 'overdue'] } } }),
      this.prisma.utility_bills.count({ where: { status: { in: ['unpaid', 'partial', 'overdue'] } } }),
      this.prisma.caretaker_tasks.count({ where: name === 'caretaker' ? { assigned_to_user_id: this.userId(user) } : {} }),
    ]);
    return response(`${name} dashboard fetched successfully`, { workers, applications, flats, complaints, rentUnpaid, utilityUnpaid, tasks });
  }

  async report(resource: string, query: Record<string, unknown>) {
    const map: Record<string, string> = {
      workers: 'workers',
      applications: 'worker-applications',
      'flat-assignments': 'flat-assignments',
      rent: 'rent-invoices',
      utilities: 'utility-bills',
      complaints: 'complaints',
      assets: 'assets',
      'caretaker-attendance': 'caretaker-attendance',
      'caretaker-gps': 'caretaker-gps',
    };
    const target = map[resource];
    if (!target) throw new BadRequestException('Unknown report');
    return this.list(target, query);
  }

  async auditEntity(entityType: string, entityId: string) {
    return this.list('audit-logs', { entity_type: entityType, entity_id: parseId(entityId) });
  }
}
