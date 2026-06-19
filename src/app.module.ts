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
      ignoreEnvFile: process.env.NODE_ENV === 'production',
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST') ?? 'localhost';
        const port = Number(config.get<string | number>('REDIS_PORT') ?? 6379);
        const password = config.get<string>('REDIS_PASSWORD');
        const tlsValue = config.get<string>('REDIS_TLS');
        const tls = tlsValue === 'true' ? {} : undefined;

        console.log(
          `[Redis Connection] Host: ${host}, Port: ${port}, TLS Enabled: ${tlsValue === 'true'}, Password Configured: ${!!password}`,
        );

        return {
          throttlers: [
            { name: 'default', limit: 100, ttl: 60000 },
            { name: 'auth-strict', limit: 5, ttl: 900000 },
            { name: 'auth-admin', limit: 3, ttl: 900000 },
            { name: 'auth-moderate', limit: 10, ttl: 300000 },
            { name: 'write-moderate', limit: 10, ttl: 60000 },
            { name: 'read-standard', limit: 60, ttl: 60000 },
            { name: 'read-public', limit: 30, ttl: 60000 },
            { name: 'apply-job', limit: 10, ttl: 300000 },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis({
              host,
              port,
              password: password || undefined,
              tls,
            }),
          ),
        };
      },
    }),
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
