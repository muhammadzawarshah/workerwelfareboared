import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlatAssignmentsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('flat-assignments', query); }
  findActive(query: Record<string, unknown>) { return this.activeFlatAssignments(query); }
  findHistory(query: Record<string, unknown>) { return this.flatAssignmentHistory(query); }
  findById(id: string) { return this.findOne('flat-assignments', id); }
  assign(body: unknown, user?: unknown) { return this.assignFlat(body, user as never); }
  updateAssignment(id: string, body: unknown) { return this.update('flat-assignments', id, body); }
  vacate(id: string, body: unknown) { return this.vacateFlat(id, body); }
  transfer(id: string, body: unknown, user?: unknown) { return this.transferFlat(id, body, user as never); }
  cancel(id: string) { return this.cancelFlatAssignment(id); }
}
