import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilitiesService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findConnections(query: Record<string, unknown>) { return this.list('utility-connections', query); }
  createConnection(body: unknown) { return this.create('utility-connections', body); }
  findConnectionById(id: string) { return this.findOne('utility-connections', id); }
  updateConnection(id: string, body: unknown) { return this.update('utility-connections', id, body); }
  updateConnectionStatus(id: string, body: unknown) { return this.updateStatus('utility-connections', id, body); }
  deleteConnection(id: string) { return this.remove('utility-connections', id); }
  findBills(query: Record<string, unknown>) { return this.list('utility-bills', query); }
  createBill(body: unknown) { return this.create('utility-bills', body); }
  fetchBill(body: unknown, user?: unknown) { return this.fetchUtilityBill(body, user as never); }
  fetchMonthlyBills(body: unknown, user?: unknown) { return this.fetchMonthlyUtilityBills(body, user as never); }
  findBillById(id: string) { return this.findOne('utility-bills', id); }
  updateBill(id: string, body: unknown) { return this.update('utility-bills', id, body); }
  deleteBill(id: string) { return this.remove('utility-bills', id); }
  payBill(id: string, body: unknown, user?: unknown) { return this.payUtilityBill(id, body, user as never); }
  findPayments(query: Record<string, unknown>) { return this.list('utility-payments', query); }
  createPayment(body: unknown, user?: unknown) { return this.create('utility-payments', body, user as never); }
  findFetchAttempts(query: Record<string, unknown>) { return this.list('utility-fetch-attempts', query); }
  logFetchAttempt(body: unknown) { return this.logUtilityFetch(body); }
}
