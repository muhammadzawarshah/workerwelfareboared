import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsGuard } from './guards/audit-logs.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@UseGuards(AuditLogsGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}
  @Get()
  list(@Query() query: ListQueryDto) { return this.service.list('audit-logs', query as Record<string, unknown>); }
  @Get('entity/:entityType/:entityId')
  entity(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.service.auditEntity(entityType, entityId);
  }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne('audit-logs', id); }
}
