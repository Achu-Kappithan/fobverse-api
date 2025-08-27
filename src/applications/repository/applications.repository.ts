import { Injectable } from '@nestjs/common';
import { IApplicationRepository } from '../interfaces/application.repository.interface';
import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  ApplicationDocument,
  Applications,
} from '../schema/applications.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ApplicationRepository
  extends BaseRepository<ApplicationDocument>
  implements IApplicationRepository
{
  constructor(
    @InjectModel(Applications.name)
    private readonly applicationModal: Model<ApplicationDocument>,
  ) {
    super(applicationModal);
  }
}
