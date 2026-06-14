import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('assets', query); }
  findById(id: string) { return this.findOne('assets', id); }
  createAsset(body: unknown) { return this.create('assets', body); }
  updateAsset(id: string, body: unknown) { return this.update('assets', id, body); }
  deleteAsset(id: string) { return this.remove('assets', id); }
  findStatusHistory(id: string, query: Record<string, unknown>) { return this.related('assets', id, 'status-history', query); }
  addStatus(id: string, body: unknown) { return this.createAssetStatus(id, body); }
}
