import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ZonesGuard } from './guards/zones.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ZonesService } from './zones.service';

@Controller('zones')
@UseGuards(ZonesGuard)
export class ZonesController {
  constructor(private readonly service: ZonesService) {}
  @Get()
  list(@Query() query: ListQueryDto) { return this.service.list('zones', query as Record<string, unknown>); }
  @Post()
  create(@Body() body: unknown) { return this.service.create('zones', body); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('zones', id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.service.update('zones', id, body); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove('zones', id); }
}
