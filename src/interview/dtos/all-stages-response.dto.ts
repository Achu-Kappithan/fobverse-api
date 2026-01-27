import { Expose, Type } from 'class-transformer';
import { ScheduleResponseDto } from './interview.responce.dto';
import { ApplicationDetailsResponseDto } from '../../applications/dtos/application-details.response.dto';

export class AllStagesResponseDto {
  @Expose()
  @Type(() => ApplicationDetailsResponseDto)
  atsStage: ApplicationDetailsResponseDto;

  @Expose()
  @Type(() => ScheduleResponseDto)
  shortlistedStage: ScheduleResponseDto | null;

  @Expose()
  @Type(() => ScheduleResponseDto)
  techStage: ScheduleResponseDto | null;
}
