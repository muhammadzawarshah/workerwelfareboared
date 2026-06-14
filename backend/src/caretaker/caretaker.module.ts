import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CaretakerController } from './caretaker.controller';
import { TaskProofsController } from './task-proofs.controller';
import { CaretakerService } from './caretaker.service';

@Module({ imports: [PrismaModule], controllers: [CaretakerController, TaskProofsController], providers: [CaretakerService] })
export class CaretakerModule {}
