import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { jwtConfig } from "src/shared/configs/jwt.config";

@Module({
  imports: [
    PassportModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtConfig.useFactory, 
      inject: jwtConfig.inject, 
    }),
    ConfigModule, 
  ],
  providers: [],
  controllers: [],
})
export class AuthModule {}