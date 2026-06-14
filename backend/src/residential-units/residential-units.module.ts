import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResidentialUnitsController } from './residential-units.controller';
import { ResidentialUnitsService } from './residential-units.service';

@Module({ imports: [PrismaModule], controllers: [ResidentialUnitsController], providers: [ResidentialUnitsService] })
export class ResidentialUnitsModule {}
