import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { asset_status } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  colony_id?: number;
}

export class UpdateAssetDto extends CreateAssetDto {}

export class CreateAssetStatusDto {
  @IsEnum(asset_status)
  status!: asset_status;

  @IsOptional()
  @IsInt()
  repaired_image_id?: number;
}
