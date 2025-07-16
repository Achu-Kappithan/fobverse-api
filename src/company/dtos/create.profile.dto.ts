
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateProfileDto {
  @IsMongoId()
  adminUserId: string;

  @IsNotEmpty()
  name: string;
}
