

import { IsMongoId, IsString } from 'class-validator';

export class CreateCandidateProfileDto {
  @IsMongoId()
  adminUserId: string;

  @IsString()
  name: string;
}
