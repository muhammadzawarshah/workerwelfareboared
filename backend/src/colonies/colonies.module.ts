import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ColoniesController } from './colonies.controller';
import { ColoniesService } from './colonies.service';

@Module({ imports: [PrismaModule], controllers: [ColoniesController], providers: [ColoniesService] })
export class ColoniesModule {}
