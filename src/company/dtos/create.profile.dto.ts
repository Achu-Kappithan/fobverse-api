
import { IsNotEmpty, IsMongoId, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsMongoId()
  UserId: string;

  @IsNotEmpty()
  name: string;
}


export class CoamapnyUserDto  {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'User role is not defined' })
  role: string;
}
