import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsGuard } from './guards/notifications.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(NotificationsGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get() list(@Query() q: ListQueryDto) { return this.service.list('notifications', q as Record<string, unknown>); }
  @Post() create(@Body() b: unknown) { return this.service.create('notifications', b); }
  @Patch('read-all') readAll(@Req() req: { user?: unknown }) { return this.service.markAllNotificationsRead(req.user as never); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne('notifications', id); }
  @Patch(':id/read') read(@Param('id') id: string) { return this.service.markNotificationRead(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove('notifications', id); }
}
