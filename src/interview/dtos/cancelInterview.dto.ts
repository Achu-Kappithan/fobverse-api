import { IsNotEmpty } from 'class-validator';

export class CancelInterviewDto {
  @IsNotEmpty()
  applicationId: string;

  @IsNotEmpty()
  stage: string;

  @IsNotEmpty()
  userEmail: string;
}
