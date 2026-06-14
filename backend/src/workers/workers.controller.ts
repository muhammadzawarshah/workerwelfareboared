import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { WorkersGuard } from './guards/workers.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { WorkersService } from './workers.service';

@Controller('workers')
@UseGuards(WorkersGuard)
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}
  @Get('search')
  search(@Query() query: Record<string, unknown>) { return this.workersService.searchWorkers(query); }
  @Get('by-cnic/:cnic')
  byCnic(@Param('cnic') cnic: string) { return this.workersService.findByCnic(cnic); }
  @Get()
  list(@Query() query: ListQueryDto, @Req() req: { user?: unknown }) { return this.workersService.findAll(query as Record<string, unknown>, req.user); }
  @Post()
  create(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.workersService.createWorker(body, req.user); }
  @Get(':id/:child')
  related(@Param('id') id: string, @Param('child') child: string, @Query() query: Record<string, unknown>) {
    return this.workersService.findRelated(id, child, query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.workersService.findById(id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.workersService.updateWorker(id, body); }
  @Patch(':id/status')
  status(@Param('id') id: string, @Body() body: unknown) { return this.workersService.updateWorkerStatus(id, body); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.workersService.deleteWorker(id); }
}
