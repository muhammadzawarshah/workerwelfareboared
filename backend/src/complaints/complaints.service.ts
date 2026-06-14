import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplaintsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('complaints', query); }
  findById(id: string) { return this.findOne('complaints', id); }
  createComplaint(body: unknown) { return this.create('complaints', body); }
  updateComplaint(id: string, body: unknown) { return this.update('complaints', id, body); }
  deleteComplaint(id: string) { return this.remove('complaints', id); }
  assign(id: string, body: unknown, user?: unknown) { return this.assignComplaint(id, body, user as never); }
  start(id: string) { return this.setComplaintStatus(id, 'in_progress'); }
  resolve(id: string, body?: unknown, user?: unknown) {
    // Caretaker verifies on-site by attaching a proof image (+ GPS); an admin
    // can still resolve with a plain status change.
    const hasProof = !!body && typeof body === 'object' && 'image_document_id' in (body as Record<string, unknown>);
    return hasProof
      ? this.resolveComplaintWithProof(id, body, user as never)
      : this.setComplaintStatus(id, 'resolved');
  }
  close(id: string) { return this.setComplaintStatus(id, 'closed'); }
  reopen(id: string) { return this.setComplaintStatus(id, 'reopened'); }
  findBudgets(query: Record<string, unknown>) { return this.list('complaint-budgets', query); }
  createBudget(body: unknown) { return this.create('complaint-budgets', body); }
  updateBudget(id: string, body: unknown) { return this.update('complaint-budgets', id, body); }
  deleteBudget(id: string) { return this.remove('complaint-budgets', id); }
}
