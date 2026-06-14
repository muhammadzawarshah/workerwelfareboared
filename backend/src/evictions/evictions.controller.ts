import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { EvictionsService } from './evictions.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class EvictionsController {
  constructor(private readonly service: EvictionsService) {}

  @Get('eviction-cases')
  listCases(@Query() q: ListQueryDto) { return this.service.list('eviction-cases', q as Record<string, unknown>); }
  @Post('eviction-cases')
  createCase(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.create('eviction-cases', b, req.user as never); }
  @Get('eviction-cases/:id')
  getCase(@Param('id') id: string) { return this.service.findOne('eviction-cases', id); }
  @Put('eviction-cases/:id')
  updateCase(@Param('id') id: string, @Body() b: unknown) { return this.service.update('eviction-cases', id, b); }
  @Delete('eviction-cases/:id')
  deleteCase(@Param('id') id: string) { return this.service.remove('eviction-cases', id); }

  @Get('eviction-hearings')
  listHearings(@Query() q: ListQueryDto) { return this.service.list('eviction-hearings', q as Record<string, unknown>); }
  @Post('eviction-hearings')
  createHearing(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.createHearing(b, req.user as never); }
  @Get('eviction-hearings/:id')
  getHearing(@Param('id') id: string) { return this.service.findOne('eviction-hearings', id); }
  @Put('eviction-hearings/:id')
  updateHearing(@Param('id') id: string, @Body() b: unknown) { return this.service.update('eviction-hearings', id, b); }
  @Delete('eviction-hearings/:id')
  deleteHearing(@Param('id') id: string) { return this.service.remove('eviction-hearings', id); }
}
