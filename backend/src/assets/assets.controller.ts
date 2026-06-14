import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AssetsGuard } from './guards/assets.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { AssetsService } from './assets.service';

@Controller('assets')
@UseGuards(AssetsGuard)
export class AssetsController {
  constructor(private readonly service: AssetsService) {}
  @Get()
  list(@Query() q: ListQueryDto) { return this.service.list('assets', q as Record<string, unknown>); }
  @Post()
  create(@Body() b: unknown) { return this.service.create('assets', b); }
  @Get(':id/status-history')
  history(@Param('id') id: string, @Query() q: Record<string, unknown>) { return this.service.related('assets', id, 'status-history', q); }
  @Post(':id/status')
  status(@Param('id') id: string, @Body() b: unknown) { return this.service.createAssetStatus(id, b); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('assets', id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() b: unknown) { return this.service.update('assets', id, b); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove('assets', id); }
}
