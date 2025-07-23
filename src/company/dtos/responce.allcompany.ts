import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ObjectId, Types } from 'mongoose';


export class TeamMemberResponceDto {
  @Expose()
  name: string;

  @Expose()
  role: string;

  @Expose()
  image: string;
}

export class ContactInfoItem {
  @Expose()
  type: string;

  @Expose()
  value: string;
}

export class CompanyProfileResponseDto {
  @Exclude()
  _id: string;

  @Exclude()
  adminUserId: string;

  @Expose()
  name: string;

  @Expose()
  industry?: string;

  @Expose()
  contactInfo?: ContactInfoItem[];

  @Expose()
  officeLocation?: string[];

  @Expose()
  techStack?: string[];

  @Expose()
  imageGallery:string[]

  @Expose()
  benafits?:string[]

  @Expose()
  logoUrl?: string;

  @Expose()
  description?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => TeamMemberResponceDto)
  teamMembers?: TeamMemberResponceDto[];

}



export class InternalUserResponceDto {
  @Expose({ name: 'id' }) 
  @Transform(({ value }) => {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }
    return value; 
  }, { toPlainOnly: true }) 
  _id: string; 

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
  __v: number; // Mongoose __v is typically a number, not a string
}
