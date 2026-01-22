import { Expose, Type } from 'class-transformer';
import { ScheduleResponseDto } from './interview.responce.dto';
import { ApplicationResponceDto } from '../../applications/dtos/application.responce';

export class AllStagesResponseDto {
  @Expose()
  @Type(() => ApplicationResponceDto)
  atsStage: ApplicationResponceDto;

  @Expose()
  @Type(() => ScheduleResponseDto)
  shortlistedStage: ScheduleResponseDto | null;

  @Expose()
  @Type(() => ScheduleResponseDto)
  techStage: ScheduleResponseDto | null;
}
