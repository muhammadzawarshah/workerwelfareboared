import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColoniesService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('colonies', query); }
  findById(id: string) { return this.findOne('colonies', id); }
  createColony(body: unknown) { return this.create('colonies', body); }
  updateColony(id: string, body: unknown) { return this.update('colonies', id, body); }
  deleteColony(id: string) { return this.remove('colonies', id); }
}
