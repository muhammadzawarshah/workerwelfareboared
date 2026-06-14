import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DashboardGuard } from './guards/dashboard.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(DashboardGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get(':name')
  dashboard(@Param('name') name: string, @Req() req: { user?: unknown }) {
    return this.service.dashboard(name, req.user as never);
  }
}
