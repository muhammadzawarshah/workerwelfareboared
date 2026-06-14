import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ResidentialUnitsGuard } from './guards/residential-units.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ResidentialUnitsService } from './residential-units.service';

@Controller('residential-units')
@UseGuards(ResidentialUnitsGuard)
export class ResidentialUnitsController {
  constructor(private readonly service: ResidentialUnitsService) {}
  @Get('available')
  available(@Query() query: Record<string, unknown>, @Req() req: { user?: unknown }) { return this.service.availableUnits(query, req.user as never); }
  @Get()
  list(@Query() query: ListQueryDto, @Req() req: { user?: unknown }) { return this.service.list('residential-units', query as Record<string, unknown>, req.user as never); }
  @Post()
  create(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.create('residential-units', body, req.user as never); }
  @Get(':id/history')
  history(@Param('id') id: string, @Query() query: Record<string, unknown>) { return this.service.related('residential-units', id, 'history', query); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('residential-units', id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.update('residential-units', id, body, req.user as never); }
  @Patch(':id/status')
  status(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.updateStatus('residential-units', id, body, req.user as never); }
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user?: unknown }) { return this.service.remove('residential-units', id, req.user as never); }
}
