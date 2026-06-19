import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ContactItem } from '../schema/candidate.profile.schema';
export class CandidateProfileResponseDto {
  @Expose()
  @Transform(
    ({ obj }: { obj: { _id?: { toString(): string }; id?: string } }) =>
      obj._id?.toString() ?? obj.id,
  )
  id: string;

  @Exclude()
  UserId: string;
  @Expose()
  name: string;
  @Expose()
  aboutme: string;
  @Expose()
  isActive: boolean;
  @Expose()
  profileUrl?: string;
  @Expose()
  coverUrl?: string;
  @Expose()
  @Type(() => ContactItem)
  contactInfo?: ContactItem[];
  @Expose()
  education?: string[];
  @Expose()
  skills?: string[];
  @Expose()
  experience?: string[];
  @Expose()
  resumeUrl?: string;
  @Expose()
  portfolioLinks?: string[];
  @Expose()
  createdAt?: Date;
  @Expose()
  updatedAt?: Date;
}
