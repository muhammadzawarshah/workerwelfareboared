import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { flat_status } from '@prisma/client';

export class CreateResidentialUnitDto {
  @IsString()
  flat_no!: string;

  @IsString()
  flat_address!: string;

  @IsOptional()
  @IsInt()
  flat_rooms?: number;

  @IsInt()
  colony_id!: number;

  @IsOptional()
  @IsEnum(flat_status)
  status?: flat_status;
}

export class UpdateResidentialUnitDto extends CreateResidentialUnitDto {}

export class ResidentialUnitStatusDto {
  @IsEnum(flat_status)
  status!: flat_status;
}
