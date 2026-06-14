import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkerApplicationsController } from './worker-applications.controller';
import { WorkerApplicationsService } from './worker-applications.service';

@Module({ imports: [PrismaModule], controllers: [WorkerApplicationsController], providers: [WorkerApplicationsService] })
export class WorkerApplicationsModule {}
