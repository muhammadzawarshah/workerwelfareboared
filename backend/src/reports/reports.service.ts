import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  getReport(resource: string, query: Record<string, unknown>) {
    return this.report(resource, query);
  }

  exportReport(resource: string, query: Record<string, unknown>) {
    return this.report(resource, query);
  }
}
