import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DistrictsGuard } from './guards/districts.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { DistrictsService } from './districts.service';

@Controller('districts')
@UseGuards(DistrictsGuard)
export class DistrictsController {
  constructor(private readonly service: DistrictsService) {}

  @Get()
  list(@Query() query: ListQueryDto) { return this.service.list('districts', query as Record<string, unknown>); }

  @Post()
  create(@Body() body: unknown) { return this.service.create('districts', body); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('districts', id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.service.update('districts', id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove('districts', id); }
}
