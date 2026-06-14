import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CaretakerGuard } from './guards/caretaker.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CaretakerService } from './caretaker.service';

@Controller()
@UseGuards(CaretakerGuard)
export class CaretakerController {
  constructor(private readonly service: CaretakerService) {}
  @Post('caretaker/attendance/login') login(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.attendanceLogin(b, req.user as never); }
  @Post('caretaker/attendance/logout') logout(@Body() b: unknown) { return this.service.attendanceLogoutByBody(b); }
  @Get('caretaker/attendance') attendance(@Query() q: ListQueryDto) { return this.service.list('caretaker-attendance', q as Record<string, unknown>); }
  @Get('caretaker/attendance/:id') attendanceOne(@Param('id') id: string) { return this.service.findOne('caretaker-attendance', id); }
  @Post('caretaker-attendance/login') legacyLogin(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.attendanceLogin(b, req.user as never); }
  @Post('caretaker-attendance/:id/logout') legacyLogout(@Param('id') id: string, @Body() b: unknown) { return this.service.attendanceLogout(id, b); }

  @Post('caretaker/gps') gps(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.gpsPing(b, req.user as never); }
  @Get('caretaker/gps') gpsList(@Query() q: ListQueryDto) { return this.service.list('caretaker-gps', q as Record<string, unknown>); }
  @Get('caretaker/gps/:userId') gpsUser(@Param('userId') userId: string, @Query() q: Record<string, unknown>) { return this.service.list('caretaker-gps', { ...q, user_id: Number(userId) }); }
  @Post('caretaker-gps/ping') legacyGps(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.gpsPing(b, req.user as never); }

  @Get('caretaker/tasks') tasks(@Query() q: ListQueryDto) { return this.service.list('caretaker-tasks', q as Record<string, unknown>); }
  @Post('caretaker/tasks') createTask(@Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.create('caretaker-tasks', b, req.user as never); }
  @Get('caretaker/tasks/:id') task(@Param('id') id: string) { return this.service.findOne('caretaker-tasks', id); }
  @Put('caretaker/tasks/:id') updateTask(@Param('id') id: string, @Body() b: unknown) { return this.service.update('caretaker-tasks', id, b); }
  @Delete('caretaker/tasks/:id') deleteTask(@Param('id') id: string) { return this.service.remove('caretaker-tasks', id); }
  @Post('caretaker/tasks/:id/accept') accept(@Param('id') id: string) { return this.service.setTaskStatus(id, 'accepted'); }
  @Post('caretaker/tasks/:id/start') start(@Param('id') id: string) { return this.service.setTaskStatus(id, 'in_progress'); }
  @Post('caretaker/tasks/:id/complete') complete(@Param('id') id: string) { return this.service.setTaskStatus(id, 'completed'); }
  @Post('caretaker/tasks/:id/reject') reject(@Param('id') id: string) { return this.service.setTaskStatus(id, 'rejected'); }
  @Post('caretaker-tasks/:id/proofs') proof(@Param('id') id: string, @Body() b: unknown, @Req() req: { user?: unknown }) { return this.service.uploadTaskProof(id, b, req.user as never); }
}
