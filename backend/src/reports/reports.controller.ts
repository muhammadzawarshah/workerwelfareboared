import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsGuard } from './guards/reports.guard';
import { ReportsService } from './reports.service';

@Controller()
@UseGuards(ReportsGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}
  @Get('reports/:resource')
  report(@Param('resource') resource: string, @Query() query: Record<string, unknown>) {
    return this.service.report(resource, query);
  }
  @Get('exports/:resource')
  export(@Param('resource') resource: string, @Query() query: Record<string, unknown>) {
    return this.service.report(resource, query);
  }
}
