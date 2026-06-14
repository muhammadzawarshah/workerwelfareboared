import { IsBoolean, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateIndustryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  registration_no?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contact_person?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateIndustryDto extends CreateIndustryDto {}

export class AddIndustryUserDto {
  @IsInt()
  user_id!: number;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
