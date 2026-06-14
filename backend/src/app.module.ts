import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IndustriesModule } from './industries/industries.module';
import { ColoniesModule } from './colonies/colonies.module';
import { ZonesModule } from './zones/zones.module';
import { DistrictsModule } from './districts/districts.module';
import { ResidentialUnitsModule } from './residential-units/residential-units.module';
import { WorkersModule } from './workers/workers.module';
import { WorkerApplicationsModule } from './worker-applications/worker-applications.module';
import { DocumentsModule } from './documents/documents.module';
import { FlatAssignmentsModule } from './flat-assignments/flat-assignments.module';
import { RentModule } from './rent/rent.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AssetsModule } from './assets/assets.module';
import { CaretakerModule } from './caretaker/caretaker.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { EvictionsModule } from './evictions/evictions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    IndustriesModule,
    ColoniesModule,
    ZonesModule,
    DistrictsModule,
    ResidentialUnitsModule,
    WorkersModule,
    WorkerApplicationsModule,
    DocumentsModule,
    FlatAssignmentsModule,
    RentModule,
    UtilitiesModule,
    ComplaintsModule,
    AssetsModule,
    CaretakerModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
    AuditLogsModule,
    EvictionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
