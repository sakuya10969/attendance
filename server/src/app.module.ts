import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AttendanceModule } from './attendance/attendance.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuthModule } from './auth/auth.module';
import { ClockCorrectionsModule } from './clock-corrections/clock-corrections.module';
import { ClosingModule } from './closing/closing.module';
import { EmployeesModule } from './employees/employees.module';
import { FirebaseModule } from './firebase/firebase.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    FirebaseModule,
    AuditLogsModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    EmployeesModule,
    AttendanceModule,
    ClockCorrectionsModule,
    LeaveRequestsModule,
    ClosingModule,
    SettingsModule,
  ],
})
export class AppModule {}
