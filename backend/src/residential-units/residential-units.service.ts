import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResidentialUnitsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('residential-units', query); }
  findAvailable(query: Record<string, unknown>) { return this.availableUnits(query); }
  findById(id: string) { return this.findOne('residential-units', id); }
  findHistory(id: string, query: Record<string, unknown>) { return this.related('residential-units', id, 'history', query); }
  createUnit(body: unknown) { return this.create('residential-units', body); }
  updateUnit(id: string, body: unknown) { return this.update('residential-units', id, body); }
  updateUnitStatus(id: string, body: unknown) { return this.updateStatus('residential-units', id, body); }
  deleteUnit(id: string) { return this.remove('residential-units', id); }
}
