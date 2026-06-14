import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { FlatAssignmentsGuard } from './guards/flat-assignments.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { FlatAssignmentsService } from './flat-assignments.service';

@Controller('flat-assignments')
@UseGuards(FlatAssignmentsGuard)
export class FlatAssignmentsController {
  constructor(private readonly service: FlatAssignmentsService) {}
  @Get('active')
  active(@Query() query: Record<string, unknown>) { return this.service.activeFlatAssignments(query); }
  @Get('history')
  history(@Query() query: Record<string, unknown>) { return this.service.flatAssignmentHistory(query); }
  @Get()
  list(@Query() query: ListQueryDto) { return this.service.list('flat-assignments', query as Record<string, unknown>); }
  @Post()
  create(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.assignFlat(body, req.user as never); }
  @Post('assign')
  assign(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.assignFlat(body, req.user as never); }
  @Post(':id/vacate')
  vacate(@Param('id') id: string, @Body() body: unknown) { return this.service.vacateFlat(id, body); }
  @Post(':id/transfer')
  transfer(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.transferFlat(id, body, req.user as never); }
  @Post(':id/cancel')
  cancel(@Param('id') id: string) { return this.service.cancelFlatAssignment(id); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('flat-assignments', id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.service.update('flat-assignments', id, body); }
}
