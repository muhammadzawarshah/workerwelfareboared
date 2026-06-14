import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { RentGuard } from './guards/rent.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { RentService } from './rent.service';

@Controller()
@UseGuards(RentGuard)
export class RentController {
  constructor(private readonly service: RentService) {}
  @Get('rent-rates') listRates(@Query() q: ListQueryDto) { return this.service.list('rent-rates', q as Record<string, unknown>); }
  @Post('rent-rates') createRate(@Body() b: unknown) { return this.service.create('rent-rates', b); }
  @Get('rent-rates/:id') getRate(@Param('id') id: string) { return this.service.findOne('rent-rates', id); }
  @Put('rent-rates/:id') updateRate(@Param('id') id: string, @Body() b: unknown) { return this.service.update('rent-rates', id, b); }
  @Delete('rent-rates/:id') deleteRate(@Param('id') id: string) { return this.service.remove('rent-rates', id); }

  @Get('late-fee-rules') listLate(@Query() q: ListQueryDto) { return this.service.list('late-fee-rules', q as Record<string, unknown>); }
  @Post('late-fee-rules') createLate(@Body() b: unknown) { return this.service.create('late-fee-rules', b); }
  @Get('late-fee-rules/:id') getLate(@Param('id') id: string) { return this.service.findOne('late-fee-rules', id); }
  @Put('late-fee-rules/:id') updateLate(@Param('id') id: string, @Body() b: unknown) { return this.service.update('late-fee-rules', id, b); }
  @Delete('late-fee-rules/:id') deleteLate(@Param('id') id: string) { return this.service.remove('late-fee-rules', id); }

  @Get('rent-invoices') listInvoices(@Query() q: ListQueryDto, @Req() req: { user?: unknown }) { return this.service.list('rent-invoices', q as Record<string, unknown>, req.user as never); }
  @Post('rent-invoices/generate') generate(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.generateRentInvoices(b, req.user as never); }
  @Get('rent-invoices/:id') getInvoice(@Param('id') id: string) { return this.service.findOne('rent-invoices', id); }
  @Put('rent-invoices/:id') updateInvoice(@Param('id') id: string, @Body() b: unknown) { return this.service.update('rent-invoices', id, b); }
  @Post('rent-invoices/:id/pay') payInvoice(@Param('id') id: string, @Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.payRentInvoice(id, b, req.user as never); }
  @Post('rent-invoices/:id/apply-late-fee') lateFee(@Param('id') id: string) { return this.service.applyLateFee(id); }
  @Post('rent-invoices/:id/cancel') cancelInvoice(@Param('id') id: string) { return this.service.cancelRentInvoice(id); }

  @Get('rent-payments') listPayments(@Query() q: ListQueryDto, @Req() req: { user?: unknown }) { return this.service.list('rent-payments', q as Record<string, unknown>, req.user as never); }
  @Post('rent-payments') createPayment(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.create('rent-payments', b, req.user as never); }
  @Get('rent-payments/:id') getPayment(@Param('id') id: string) { return this.service.findOne('rent-payments', id); }
  @Put('rent-payments/:id') updatePayment(@Param('id') id: string, @Body() b: unknown) { return this.service.update('rent-payments', id, b); }
  @Delete('rent-payments/:id') deletePayment(@Param('id') id: string) { return this.service.remove('rent-payments', id); }

  // Rent collection handover: caretaker collects -> accountant remits.
  @Get('rent-collections/my-pending') myPending(@Req() req: { user?: unknown }) { return this.service.myPendingRentCollection(req.user as never); }
  @Get('rent-collections/summary') collectionSummary(@Query() q: Record<string, unknown>) { return this.service.caretakerCollectionSummary(q); }
  @Get('rent-collections/by-worker') collectionByWorker(@Query() q: Record<string, unknown>) { return this.service.rentCollectionByWorker(q); }
  @Get('rent-collections/by-colony') collectionByColony(@Query() q: Record<string, unknown>) { return this.service.rentCollectionByColony(q); }
  @Get('rent-remittances') listRemittances(@Query() q: ListQueryDto) { return this.service.list('rent-remittances', q as Record<string, unknown>); }
  @Post('rent-remittances') collectRemittance(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.collectRentRemittance(b, req.user as never); }
  @Get('rent-remittances/:id') getRemittance(@Param('id') id: string) { return this.service.findOne('rent-remittances', id); }
}
