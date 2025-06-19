import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './shared/configs/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger:WinstonModule.createLogger(
      loggerConfig(process.env.NODE_ENV || 'development')
    )
  });

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform:true, 
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  )

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') ?? 3009;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap();
