import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistrictsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
