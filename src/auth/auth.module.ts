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
import { AUTH_REPOSITORY } from "./interfaces/IAuthRepository";
import { AuthRepository } from "./auth.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/candidate.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
    {
      provide:AUTH_REPOSITORY,
      useClass:AuthRepository
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