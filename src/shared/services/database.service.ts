import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    this.connection.on('connecting', () => {
      console.log('🔄 Attempting to connect to MongoDB...');
    });

    this.connection.on('connected', () => {
      console.log('✅ Successfully connected to MongoDB!');
    });

    this.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    this.connection.on('disconnected', () => {
      console.log('⚠️ Disconnected from MongoDB');
    });
  }
}
