import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FlatAssignmentsController } from './flat-assignments.controller';
import { FlatAssignmentsService } from './flat-assignments.service';

@Module({ imports: [PrismaModule], controllers: [FlatAssignmentsController], providers: [FlatAssignmentsService] })
export class FlatAssignmentsModule {}
