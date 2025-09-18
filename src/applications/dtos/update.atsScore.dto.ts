import { IsNotEmpty } from 'class-validator';

export class updateAtsScoreDto {
  @IsNotEmpty()
  newscore: number;

  @IsNotEmpty()
  jobId: string;
}
