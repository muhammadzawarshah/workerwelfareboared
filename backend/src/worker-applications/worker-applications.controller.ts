import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { WorkerApplicationsGuard } from './guards/worker-applications.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { WorkerApplicationsService } from './worker-applications.service';

@Controller('worker-applications')
@UseGuards(WorkerApplicationsGuard)
export class WorkerApplicationsController {
  constructor(private readonly applicationsService: WorkerApplicationsService) {}
  @Get()
  list(@Query() query: ListQueryDto, @Req() req: { user?: unknown }) { return this.applicationsService.findAll(query as Record<string, unknown>, req.user); }
  @Post()
  create(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.createApplication(body, req.user); }
  @Post('intake')
  intake(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.intake(body, req.user); }
  @Get(':id/documents')
  documents(@Param('id') id: string, @Query() query: Record<string, unknown>) { return this.applicationsService.findDocuments(id, query); }
  @Get(':id/history')
  history(@Param('id') id: string, @Query() query: Record<string, unknown>) { return this.applicationsService.findHistory(id, query); }
  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: { user?: unknown }) { return this.applicationsService.submit(id, req.user); }
  @Post(':id/verify')
  verify(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.verify(id, body, req.user); }
  @Post(':id/reject-verification')
  rejectVerification(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.rejectVerificationStep(id, body, req.user); }
  @Post(':id/forward-to-ad-colony')
  forwardToAdColony(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.forwardToAdColony(id, body, req.user); }
  @Post(':id/forward-to-committee')
  forwardToCommittee(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.forwardToCommittee(id, body, req.user); }
  @Post(':id/issue-notification')
  issueNotification(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.issueNotification(id, body, req.user); }
  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.approve(id, body, req.user); }
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.applicationsService.reject(id, body, req.user); }
  @Post(':id/defer')
  defer(@Param('id') id: string, @Body() body: unknown) { return this.applicationsService.defer(id, body); }
  @Post(':id/cancel')
  cancel(@Param('id') id: string) { return this.applicationsService.cancel(id); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.applicationsService.findById(id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.applicationsService.updateApplication(id, body); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.applicationsService.deleteApplication(id); }
}
