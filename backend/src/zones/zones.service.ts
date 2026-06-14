import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('zones', query); }
  findById(id: string) { return this.findOne('zones', id); }
  createZone(body: unknown) { return this.create('zones', body); }
  updateZone(id: string, body: unknown) { return this.update('zones', id, body); }
  deleteZone(id: string) { return this.remove('zones', id); }
}
