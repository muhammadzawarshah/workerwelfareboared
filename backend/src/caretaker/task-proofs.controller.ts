import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CaretakerGuard } from './guards/caretaker.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CaretakerService } from './caretaker.service';

@Controller('task-proofs')
@UseGuards(CaretakerGuard)
export class TaskProofsController {
  constructor(private readonly service: CaretakerService) {}
  @Get() list(@Query() q: ListQueryDto) { return this.service.list('task-proofs', q as Record<string, unknown>); }
  @Post() create(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.create('task-proofs', b, req.user as never); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne('task-proofs', id); }
  @Post(':id/approve') approve(@Param('id') id: string) { return this.service.approveTaskProof(id); }
  @Post(':id/reject') reject(@Param('id') id: string) { return this.service.rejectTaskProof(id); }
}
