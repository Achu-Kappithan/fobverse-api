import { IsArray, IsOptional, IsString } from 'class-validator';

export class SignatureRequestDto {
  @IsString()
  folder: string;

  @IsOptional()
  @IsString()
  publicIdPrefix?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
