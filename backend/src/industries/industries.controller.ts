import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IndustriesGuard } from './guards/industries.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { IndustriesService } from './industries.service';

@Controller('industries')
@UseGuards(IndustriesGuard)
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Get()
  list(@Query() query: ListQueryDto) { return this.industriesService.findAll(query as Record<string, unknown>); }
  @Post()
  create(@Body() body: unknown) { return this.industriesService.createIndustry(body); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.industriesService.findById(id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.industriesService.updateIndustry(id, body); }
  @Patch(':id/status')
  status(@Param('id') id: string, @Body() body: unknown) { return this.industriesService.updateIndustryStatus(id, body); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.industriesService.deleteIndustry(id); }
  @Post(':id/users')
  addUser(@Param('id') id: string, @Body() body: unknown) { return this.industriesService.attachUser(id, body); }
  @Get(':id/:child')
  related(@Param('id') id: string, @Param('child') child: string, @Query() query: Record<string, unknown>) {
    return this.industriesService.findRelated(id, child, query);
  }
}
