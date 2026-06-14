import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EvictionsController } from './evictions.controller';
import { EvictionsService } from './evictions.service';

@Module({ imports: [PrismaModule], controllers: [EvictionsController], providers: [EvictionsService] })
export class EvictionsModule {}
