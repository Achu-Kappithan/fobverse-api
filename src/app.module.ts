import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './shared/configs/logger.config';
import { CandiateModule } from './candidates/candidates.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    SharedModule,
    CandiateModule,
    AuthModule,
    CompanyModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
