import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ComplaintsGuard } from './guards/complaints.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ComplaintsService } from './complaints.service';

@Controller()
@UseGuards(ComplaintsGuard)
export class ComplaintsController {
  constructor(private readonly service: ComplaintsService) {}
  @Get('complaints') list(@Query() q: ListQueryDto) { return this.service.list('complaints', q as Record<string, unknown>); }
  @Post('complaints') create(@Body() b: unknown) { return this.service.create('complaints', b); }
  @Get('complaints/:id') findOne(@Param('id') id: string) { return this.service.findOne('complaints', id); }
  @Put('complaints/:id') update(@Param('id') id: string, @Body() b: unknown) { return this.service.update('complaints', id, b); }
  @Delete('complaints/:id') remove(@Param('id') id: string) { return this.service.remove('complaints', id); }
  @Post('complaints/:id/assign') assign(@Param('id') id: string, @Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.assignComplaint(id, b, req.user as never); }
  @Post('complaints/:id/start') start(@Param('id') id: string) { return this.service.setComplaintStatus(id, 'in_progress'); }
  @Post('complaints/:id/resolve') resolve(@Param('id') id: string, @Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.resolve(id, b, req.user); }
  @Post('complaints/:id/close') close(@Param('id') id: string) { return this.service.setComplaintStatus(id, 'closed'); }
  @Post('complaints/:id/reopen') reopen(@Param('id') id: string) { return this.service.setComplaintStatus(id, 'reopened'); }

  @Get('complaint-budgets') listBudgets(@Query() q: ListQueryDto) { return this.service.list('complaint-budgets', q as Record<string, unknown>); }
  @Post('complaint-budgets') createBudget(@Body() b: unknown) { return this.service.create('complaint-budgets', b); }
  @Get('complaint-budgets/:id') getBudget(@Param('id') id: string) { return this.service.findOne('complaint-budgets', id); }
  @Put('complaint-budgets/:id') updateBudget(@Param('id') id: string, @Body() b: unknown) { return this.service.update('complaint-budgets', id, b); }
  @Delete('complaint-budgets/:id') deleteBudget(@Param('id') id: string) { return this.service.remove('complaint-budgets', id); }
}
