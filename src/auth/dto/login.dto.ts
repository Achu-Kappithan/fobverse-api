
import { IsEmail, isNotEmpty, IsNotEmpty, isString, IsString, } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  password: string;

  @IsString({message:'UserRole is not defined'})
  @IsNotEmpty({message: 'Password cannot be empty'})
  role:string;
}


export class GoogleLoginDto {
  email: string;
  idToken: string; 

}