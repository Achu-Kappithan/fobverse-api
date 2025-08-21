/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import * as cookeParser from 'cookie-parser';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const configService = app.get(ConfigService);
  const clientUrl = configService.get<string>('CLIENT_URL');

  app.enableCors({
    origin: clientUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  app.use(cookeParser());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  const port = configService.get<string>('PORT') ?? 3009;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
