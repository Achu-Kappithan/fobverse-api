import { Exclude, Expose } from "class-transformer";
import { ObjectId } from "mongoose";

export class userDto {
  @Expose()
  _id: ObjectId;

  @Expose()
  companyId:ObjectId

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
  profileImg?:string

  @Exclude()
  __v: string;

}