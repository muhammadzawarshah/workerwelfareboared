import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ColoniesGuard } from './guards/colonies.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ColoniesService } from './colonies.service';

@Controller('colonies')
@UseGuards(ColoniesGuard)
export class ColoniesController {
  constructor(private readonly service: ColoniesService) {}
  @Get()
  list(@Query() query: ListQueryDto) { return this.service.list('colonies', query as Record<string, unknown>); }
  @Post()
  create(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.create('colonies', body, req.user as never); }
  @Get('caretaker-assignments')
  caretakerAssignments(@Query() query: Record<string, unknown>) { return this.service.list('caretaker-colonies', query); }
  @Post('caretaker-assignments')
  assignCaretaker(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.assignCaretakerToColony(body, req.user as never); }
  @Put('caretaker-assignments/:id')
  updateCaretakerAssignment(@Param('id') id: string, @Body() body: unknown) { return this.service.update('caretaker-colonies', id, body); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('colonies', id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.service.update('colonies', id, body); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove('colonies', id); }
}
