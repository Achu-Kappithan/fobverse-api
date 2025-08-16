import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class AdminProfieDto {
    @Expose()
    name:string

    @Expose()
    email:string

    @Expose()
    profileImg:string

    @Exclude()
    _id:string
}


export class UpdateAdminProfileDto {
  @IsNotEmpty()
  email:string

  @IsNotEmpty()
  name:string

  @IsOptional()
  @IsNotEmpty()
  profileImg:string
}




