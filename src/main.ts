import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import * as cookeParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    bufferLogs: true,
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors(
    {
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    allowedHeaders: 'Content-Type, Authorization', 
  })
  
  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform:true, 
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  )

  app.use(cookeParser())


  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor()
  )

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') ?? 3009;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap();
