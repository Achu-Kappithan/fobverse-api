import { Exclude, Expose, Type } from 'class-transformer';
export class TeamMemberResponseDto {
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
  @Exclude()
  adminUserId: string;
  @Expose()
  name: string;
  @Expose()
  industry?: string;
  @Expose()
  @Type(() => ContactInfoItem)
  contactInfo?: ContactInfoItem[];
  @Expose()
  officeLocation?: string[];
  @Expose()
  techStack?: string[];
  @Expose()
  imageGallery: string[];
  @Expose()
  benefits?: string[];
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
  @Type(() => TeamMemberResponseDto)
  teamMembers?: TeamMemberResponseDto[];
}
export class UserResponseDto {
  @Expose()
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
  __v: number;
}
