import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkersService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>, user?: unknown) { return this.list('workers', query, user as never); }
  findById(id: string) { return this.findOne('workers', id); }
  createWorker(body: unknown, user?: unknown) { return this.create('workers', body, user as never); }
  updateWorker(id: string, body: unknown) { return this.update('workers', id, body); }
  updateWorkerStatus(id: string, body: unknown) { return this.updateStatus('workers', id, body); }
  deleteWorker(id: string) { return this.remove('workers', id); }
  searchWorkers(query: Record<string, unknown>) { return this.searchWorker(query); }
  findByCnic(cnic: string) { return this.workerByCnic(cnic); }
  findRelated(workerId: string, child: string, query: Record<string, unknown>) { return this.related('workers', workerId, child, query); }
}
