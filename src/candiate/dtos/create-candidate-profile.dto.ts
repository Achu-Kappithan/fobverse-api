import { IsMongoId, IsString } from 'class-validator';

export class CreateCandidateProfileDto {
  @IsMongoId()
  UserId: string;

  @IsString()
  name: string;
}
