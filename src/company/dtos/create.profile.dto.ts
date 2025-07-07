
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateProfileDto {
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  name: string;
}
