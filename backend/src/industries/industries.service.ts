import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndustriesService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('industries', query); }
  findById(id: string) { return this.findOne('industries', id); }
  createIndustry(body: unknown) { return this.create('industries', body); }
  updateIndustry(id: string, body: unknown) { return this.update('industries', id, body); }
  updateIndustryStatus(id: string, body: unknown) { return this.updateStatus('industries', id, body); }
  deleteIndustry(id: string) { return this.remove('industries', id); }
  attachUser(industryId: string, body: unknown) { return this.addIndustryUser(industryId, body); }
  findRelated(industryId: string, child: string, query: Record<string, unknown>) { return this.related('industries', industryId, child, query); }
}
