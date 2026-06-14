import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  getDashboard(name: string, user?: unknown) {
    return this.dashboard(name, user as never);
  }
}
