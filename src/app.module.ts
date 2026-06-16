import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './shared/configs/logger.config';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { AdminModule } from './admin/admin.module';
import { CandiateModule } from './candiate/candidate.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { AtsSortingModule } from './ats-sorting/ats-sorting.module';
import { InterviewModule } from './interview/interview.module';
import { NotificationModule } from './notification/notification.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';
import Redis from 'ioredis';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV');
        return loggerConfig(nodeEnv!);
      },
      inject: [ConfigService],
    }),
    // ─── Rate Limiting ──────────────────────────────────────────────────────────
    // Redis-backed throttler with 8 named profiles (overridable per-route).
    // The global guard (see providers) applies the 'default' profile to ALL routes.
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          // Baseline — applies to every route not decorated with @Throttle()
          { name: 'default', limit: 100, ttl: 60000 },
          // Auth routes — strict limits to prevent brute-force & credential stuffing
          { name: 'auth-strict', limit: 5, ttl: 900000 },   // 5 req / 15 min
          { name: 'auth-admin', limit: 3, ttl: 900000 },    // 3 req / 15 min (admin)
          { name: 'auth-moderate', limit: 10, ttl: 300000 },// 10 req / 5 min (refresh/oauth)
          // Write operations — moderate limits for profile/data mutations
          { name: 'write-moderate', limit: 10, ttl: 60000 },// 10 req / 1 min
          // Read operations
          { name: 'read-standard', limit: 60, ttl: 60000 }, // 60 req / 1 min (authenticated)
          { name: 'read-public', limit: 30, ttl: 60000 },   // 30 req / 1 min (unauthenticated)
          // Job applications — prevent bot spam
          { name: 'apply-job', limit: 10, ttl: 300000 },    // 10 req / 5 min
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: config.get<string>('REDIS_HOST') ?? 'localhost',
            port: config.get<number>('REDIS_PORT') ?? 6379,
            password: config.get<string>('REDIS_PASSWORD') || undefined,
          }),
        ),
      }),
    }),
    // ────────────────────────────────────────────────────────────────────────────
    SharedModule,
    CandiateModule,
    AuthModule,
    CompanyModule,
    AdminModule,
    CloudinaryModule,
    JobsModule,
    ApplicationsModule,
    AtsSortingModule,
    InterviewModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    // Apply rate limiting globally to all routes.
    // Uses the custom guard so it reads the real client IP behind Render.com's proxy.
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
