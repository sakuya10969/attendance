import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../../generated/prisma/client';

type PrismaClientInstance = InstanceType<typeof PrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly _client: PrismaClientInstance;

  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    this._client = new PrismaClient({ adapter } as any);
  }

  async onModuleInit() {
    await this._client.$connect();
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }

  get tenant() {
    return this._client.tenant;
  }
  get user() {
    return this._client.user;
  }
  get employee() {
    return this._client.employee;
  }
  get department() {
    return this._client.department;
  }
  get workPattern() {
    return this._client.workPattern;
  }
  get attendance() {
    return this._client.attendance;
  }
  get breakRecord() {
    return this._client.breakRecord;
  }
  get clockCorrection() {
    return this._client.clockCorrection;
  }
  get leaveRequest() {
    return this._client.leaveRequest;
  }
  get closingRecord() {
    return this._client.closingRecord;
  }
  get auditLog() {
    return this._client.auditLog;
  }

  get $transaction() {
    return this._client.$transaction.bind(this._client);
  }
}
