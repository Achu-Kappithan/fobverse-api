import { Exclude, Expose, Type } from 'class-transformer';

class InternalUserDto {
  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  profilePic?: string;

  @Exclude()
  password: string;
}

class TeamMemberDto {
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
  @Expose()
  _id: string;

  @Expose()
  userId: string;

  @Expose()
  name: string;

  @Expose()
  industry?: string;

  @Expose()
  contactInfo?: ContactInfoItem[];  @Expose()

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
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @Expose()
  @Type(() => InternalUserDto)
  internalUsers?: InternalUserDto[];
}
