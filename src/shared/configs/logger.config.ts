import { WinstonModuleOptions, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file'; // Essential for DailyRotateFile to be available

export const loggerConfig = (env: string): WinstonModuleOptions => {
  // Explicitly define the type of transports as an array of winston.transport instances.
  // This is the key change to resolve the TypeScript error.
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', { colors: true, prettyPrint: true }),
      ),
    }),
  ];

  if (env === 'production' || env === 'development') { // Or adjust based on your needs
    // Daily file rotation for general logs
    transports.push(new (winston.transports as any).DailyRotateFile({ // Cast to 'any' for DailyRotateFile workaround
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()), // Specific format for this file
    }));

    // Daily file rotation for error logs only
    transports.push(new (winston.transports as any).DailyRotateFile({ // Cast to 'any' for DailyRotateFile workaround
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()), // Specific format for this file
    }));
  }

  return {
    transports,
    // You can set a default format here if you want it applied to all transports
    // that don't have their own specific format.
    // However, since we've now added format to each file transport, this global one
    // might not be strictly necessary if console has its own as well.
    // If you remove it, make sure each transport has a format.
    // format: winston.format.combine(
    //   winston.format.timestamp(),
    //   winston.format.json() // Example default for others
    // ),
  };
};