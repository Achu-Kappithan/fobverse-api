import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { InterviewDocument } from '../schema/interview.schema';
import { IInterviewRepository } from '../interfaces/interview.repository.interface';

@Injectable()
export class InterviewRepository
  extends BaseRepository<InterviewDocument>
  implements IInterviewRepository {}
