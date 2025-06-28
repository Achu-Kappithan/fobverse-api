import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { CandiateModule } from "src/candidates/candidates.module";
import { jwtConfig } from "src/shared/configs/jwt.config";
import { AuthService } from "./auth.service";
import { AUTH_SERVICE } from "./interfaces/IAuthCandiateService";
import { AuthController } from "./auth.controller";
import { EmailModule } from "src/email/email.module";
import { JwtAccessStrategy } from "./strategies/jwt.strategy";
import { jwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { JwtTokenService } from "./jwt.services/jwt-service";
import { GoogleStrategy } from "./strategies/google.strategy";

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
    EmailModule,
  ],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass:AuthService
    },
    JwtAccessStrategy,
    GoogleStrategy,
    jwtRefreshStrategy,
    JwtTokenService
  ],
  controllers: [AuthController],
  exports:[
      AUTH_SERVICE,
  ]
})
export class AuthModule {}