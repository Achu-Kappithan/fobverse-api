import { Injectable } from '@nestjs/common';
import { InotificationService } from './interfaces/notification.repository.interface';

@Injectable()
export class NotificationService implements InotificationService {}
