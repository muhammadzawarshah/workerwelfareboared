import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UtilitiesGuard } from './guards/utilities.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { UtilitiesService } from './utilities.service';

@Controller()
@UseGuards(UtilitiesGuard)
export class UtilitiesController {
  constructor(private readonly service: UtilitiesService) {}
  @Get('utility-connections') listConnections(@Query() q: ListQueryDto) { return this.service.list('utility-connections', q as Record<string, unknown>); }
  @Post('utility-connections') createConnection(@Body() b: unknown) { return this.service.create('utility-connections', b); }
  @Get('utility-connections/:id') getConnection(@Param('id') id: string) { return this.service.findOne('utility-connections', id); }
  @Put('utility-connections/:id') updateConnection(@Param('id') id: string, @Body() b: unknown) { return this.service.update('utility-connections', id, b); }
  @Patch('utility-connections/:id/status') statusConnection(@Param('id') id: string, @Body() b: unknown) { return this.service.updateStatus('utility-connections', id, b); }
  @Delete('utility-connections/:id') deleteConnection(@Param('id') id: string) { return this.service.remove('utility-connections', id); }

  @Get('utility-bills') listBills(@Query() q: ListQueryDto) { return this.service.list('utility-bills', q as Record<string, unknown>); }
  @Post('utility-bills') createBill(@Body() b: unknown) { return this.service.create('utility-bills', b); }
  @Post('utility-bills/fetch') fetchBill(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.fetchUtilityBill(b, req.user as never); }
  @Post('utility-bills/fetch-monthly') fetchMonthly(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.fetchMonthlyUtilityBills(b, req.user as never); }
  @Get('utility-bills/:id') getBill(@Param('id') id: string) { return this.service.findOne('utility-bills', id); }
  @Put('utility-bills/:id') updateBill(@Param('id') id: string, @Body() b: unknown) { return this.service.update('utility-bills', id, b); }
  @Delete('utility-bills/:id') deleteBill(@Param('id') id: string) { return this.service.remove('utility-bills', id); }
  @Post('utility-bills/:id/pay') payBill(@Param('id') id: string, @Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.payUtilityBill(id, b, req.user as never); }

  @Get('utility-payments') listPayments(@Query() q: ListQueryDto) { return this.service.list('utility-payments', q as Record<string, unknown>); }
  @Post('utility-payments') createPayment(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.create('utility-payments', b, req.user as never); }
  @Get('utility-payments/:id') getPayment(@Param('id') id: string) { return this.service.findOne('utility-payments', id); }
  @Put('utility-payments/:id') updatePayment(@Param('id') id: string, @Body() b: unknown) { return this.service.update('utility-payments', id, b); }
  @Delete('utility-payments/:id') deletePayment(@Param('id') id: string) { return this.service.remove('utility-payments', id); }

  @Get('utility-fetch-attempts') listAttempts(@Query() q: ListQueryDto) { return this.service.list('utility-fetch-attempts', q as Record<string, unknown>); }
  @Post('utility-fetch-attempts/log') logAttempt(@Body() b: unknown) { return this.service.logUtilityFetch(b); }
}
