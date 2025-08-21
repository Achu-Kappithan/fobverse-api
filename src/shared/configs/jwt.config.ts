import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = {
  useFactory: (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.get<string>('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    },
  }),
  inject: [ConfigService],
};
