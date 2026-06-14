import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findDocumentTypes(query: Record<string, unknown>) { return this.list('document-types', query); }
  createDocumentType(body: unknown) { return this.create('document-types', body); }
  findDocumentTypeById(id: string) { return this.findOne('document-types', id); }
  updateDocumentType(id: string, body: unknown) { return this.update('document-types', id, body); }
  deleteDocumentType(id: string) { return this.remove('document-types', id); }
  findAll(query: Record<string, unknown>) { return this.list('documents', query); }
  findById(id: string) { return this.findOne('documents', id); }
  createDocument(body: unknown, user?: unknown) { return this.create('documents', body, user as never); }
  updateDocument(id: string, body: unknown) { return this.update('documents', id, body); }
  deleteDocument(id: string) { return this.remove('documents', id); }
}
