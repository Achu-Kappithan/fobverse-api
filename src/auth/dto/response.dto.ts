import { Exclude, Expose } from 'class-transformer';
import { ObjectId } from 'mongoose';

export class ResponseRegisterDto {
  @Expose()
  _id: ObjectId;

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

  @Exclude()
  __v: string;

  constructor(partial: Partial<ResponseRegisterDto>) {
    Object.assign(this, partial);
  }
}
