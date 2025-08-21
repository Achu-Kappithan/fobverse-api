import {
  WinstonModuleOptions,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const loggerConfig = (env: string): WinstonModuleOptions => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ];

  if (env === 'production' || env === 'development') {
    transports.push(
      new DailyRotateFile({
        filename: process.env.LOG_FILE_NAME || 'logs/application-%DATE%.log',
        datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
        zippedArchive: process.env.LOG_ZIPPED_ARCHIVE === 'true',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return {
    transports,
  };
};
