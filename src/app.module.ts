import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';

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
    SharedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
