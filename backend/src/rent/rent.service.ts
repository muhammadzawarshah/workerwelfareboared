import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RentService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findRentRates(query: Record<string, unknown>) { return this.list('rent-rates', query); }
  createRentRate(body: unknown) { return this.create('rent-rates', body); }
  findRentRateById(id: string) { return this.findOne('rent-rates', id); }
  updateRentRate(id: string, body: unknown) { return this.update('rent-rates', id, body); }
  deleteRentRate(id: string) { return this.remove('rent-rates', id); }
  findLateFeeRules(query: Record<string, unknown>) { return this.list('late-fee-rules', query); }
  createLateFeeRule(body: unknown) { return this.create('late-fee-rules', body); }
  findLateFeeRuleById(id: string) { return this.findOne('late-fee-rules', id); }
  updateLateFeeRule(id: string, body: unknown) { return this.update('late-fee-rules', id, body); }
  deleteLateFeeRule(id: string) { return this.remove('late-fee-rules', id); }
  findInvoices(query: Record<string, unknown>) { return this.list('rent-invoices', query); }
  findInvoiceById(id: string) { return this.findOne('rent-invoices', id); }
  updateInvoice(id: string, body: unknown) { return this.update('rent-invoices', id, body); }
  generateInvoices(body: unknown) { return this.generateRentInvoices(body); }
  payInvoice(id: string, body: unknown, user?: unknown) { return this.payRentInvoice(id, body, user as never); }
  applyLateFeeToInvoice(id: string) { return this.applyLateFee(id); }
  cancelInvoice(id: string) { return this.cancelRentInvoice(id); }
  findPayments(query: Record<string, unknown>) { return this.list('rent-payments', query); }
  createPayment(body: unknown, user?: unknown) { return this.create('rent-payments', body, user as never); }
}
