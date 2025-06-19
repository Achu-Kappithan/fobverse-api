import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './shared/configs/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env'
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory:(config:ConfigService)=>({
        uri:config.get<string>('MONGO_URI')
      }),
      inject:[ConfigService]
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory:(config: ConfigService)=>{
        const nodeEnv =config.get<string>('NODE_ENV')
        return loggerConfig(nodeEnv!)
      },
      inject:[ConfigService]
    }),
    SharedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
