import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { CandiateModule } from "src/candidates/candidates.module";
import { jwtConfig } from "src/shared/configs/jwt.config";
import { AuthService } from "./auth.service";
import { AUTH_SERVICE } from "./interfaces/IAuthCandiateService";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [
    PassportModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtConfig.useFactory, 
      inject: jwtConfig.inject, 
    }),
    ConfigModule,
    CandiateModule,
    EmailModule
  ],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass:AuthService
    },
    JwtStrategy
  ],
  controllers: [AuthController],
  exports:[
      AUTH_SERVICE,
      JwtModule
  ]
})
export class AuthModule {}