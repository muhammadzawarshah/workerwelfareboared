import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { DocumentsGuard } from './guards/documents.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { DocumentsService } from './documents.service';

@Controller()
@UseGuards(DocumentsGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get('document-types')
  listTypes(@Query() query: ListQueryDto) { return this.service.list('document-types', query as Record<string, unknown>); }
  @Post('document-types')
  createType(@Body() body: unknown) { return this.service.create('document-types', body); }
  @Get('document-types/:id')
  getType(@Param('id') id: string) { return this.service.findOne('document-types', id); }
  @Put('document-types/:id')
  updateType(@Param('id') id: string, @Body() body: unknown) { return this.service.update('document-types', id, body); }
  @Delete('document-types/:id')
  deleteType(@Param('id') id: string) { return this.service.remove('document-types', id); }

  @Get('documents')
  list(@Query() query: ListQueryDto) { return this.service.list('documents', query as Record<string, unknown>); }
  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/documents', limits: { fileSize: 60 * 1024 * 1024 } }))
  upload(@UploadedFile() file: never, @Body() body: unknown, @Req() req: { user?: unknown }) {
    return this.service.uploadDocumentFile(file, body, req.user as never);
  }
  @Post('documents')
  create(@Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.create('documents', body, req.user as never); }
  @Get('documents/:id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const document = await this.service.downloadDocument(id);
    res.set({
      'Content-Type': document.mime_type,
      'Content-Disposition': `inline; filename="${document.original_file_name.replace(/"/g, '')}"`,
    });
    return new StreamableFile(createReadStream(document.file_path));
  }
  @Post('documents/:id/verify')
  verify(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.verifyDocument(id, body, req.user as never); }
  @Post('documents/:id/reject')
  reject(@Param('id') id: string, @Body() body: unknown, @Req() req: { user?: unknown }) { return this.service.rejectDocument(id, body, req.user as never); }
  @Patch('documents/:id/visibility')
  visibility(@Param('id') id: string, @Body() body: unknown) { return this.service.updateDocumentVisibility(id, body); }
  @Get('documents/:id')
  findOne(@Param('id') id: string) { return this.service.findOne('documents', id); }
  @Put('documents/:id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.service.update('documents', id, body); }
  @Delete('documents/:id')
  remove(@Param('id') id: string) { return this.service.remove('documents', id); }
}
