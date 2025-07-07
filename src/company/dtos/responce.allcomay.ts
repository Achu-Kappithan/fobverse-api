

import { Expose } from 'class-transformer';

export class CompanyResponseDto {
  @Expose()
  _id: string;

  @Expose()
  userId: string;

  @Expose()
  companyName: string;

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
