

import { Expose } from 'class-transformer';

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
  contactInfo?: string[];

  @Expose()
  officeLocation?: string[];

  @Expose()
  techStack?: string[];

  @Expose()
  location?: string;

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
}
