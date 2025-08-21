import { Exclude, Expose } from 'class-transformer';

export class userDto {
  @Expose()
  _id: string;

  @Expose()
  companyId: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Exclude()
  password: string;

  @Exclude()
  googleId: string;

  @Expose()
  profileImg?: string;

  @Exclude()
  __v: string;
}
