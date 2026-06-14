import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerApplicationsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>, user?: unknown) { return this.list('worker-applications', query, user as never); }
  findById(id: string) { return this.findOne('worker-applications', id); }
  createApplication(body: unknown, user?: unknown) { return this.create('worker-applications', body, user as never); }
  intake(body: unknown, user?: unknown) { return this.createWorkerWithApplication(body, user as never); }
  updateApplication(id: string, body: unknown) { return this.update('worker-applications', id, body); }
  deleteApplication(id: string) { return this.remove('worker-applications', id); }
  findDocuments(id: string, query: Record<string, unknown>) { return this.related('worker-applications', id, 'documents', query); }
  findHistory(id: string, query: Record<string, unknown>) { return this.related('worker-applications', id, 'history', query); }
  submit(id: string, user?: unknown) { return this.submitApplication(id, user as never); }
  verify(id: string, body: unknown, user?: unknown) { return this.verifyApplication(id, body, user as never); }
  rejectVerificationStep(id: string, body: unknown, user?: unknown) { return this.rejectVerification(id, body, user as never); }
  forwardToAdColony(id: string, body: unknown, user?: unknown) { return this.forwardApplicationToAdColony(id, body, user as never); }
  forwardToCommittee(id: string, body: unknown, user?: unknown) { return this.forwardApplicationToCommittee(id, body, user as never); }
  issueNotification(id: string, body: unknown, user?: unknown) { return this.issueAllotmentNotification(id, body, user as never); }
  approve(id: string, body: unknown, user?: unknown) { return this.approveApplication(id, body, user as never); }
  reject(id: string, body: unknown, user?: unknown) { return this.rejectApplication(id, body, user as never); }
  defer(id: string, body: unknown) { return this.deferApplication(id, body); }
  cancel(id: string) { return this.cancelApplication(id); }
}
