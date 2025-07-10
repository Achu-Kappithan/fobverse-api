

import { IsMongoId, IsString } from 'class-validator';

export class CreateCandidateProfileDto {
  @IsMongoId()
  userId: string;

  @IsString()
  name: string;
}
