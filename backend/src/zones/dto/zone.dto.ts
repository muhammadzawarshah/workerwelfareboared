import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  name!: string;

  // Assistant Director (Colonies) who manages this zone.
  @IsOptional()
  @IsInt()
  ad_user_id?: number;
}

export class UpdateZoneDto extends CreateZoneDto {}
