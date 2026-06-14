import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) {
    return this.list('audit-logs', query);
  }

  findById(id: string) {
    return this.findOne('audit-logs', id);
  }

  findByEntity(entityType: string, entityId: string) {
    return this.auditEntity(entityType, entityId);
  }
}
