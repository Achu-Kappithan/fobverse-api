import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  logger = new Logger(DatabaseService.name)
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    this.connection.on('connecting', () => {
      this.logger.log(' Attempting to connect to MongoDB...')
    });

    this.connection.on('connected', () => {
      this.logger.log(' Successfully connected to MongoDB!');
    });

    this.connection.on('error', (err) => {
      this.logger.error('MongoDB connection error:', err.message);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn(' Disconnected from MongoDB');
    });
  }
}
