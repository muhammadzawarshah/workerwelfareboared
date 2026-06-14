import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateColonyDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  // Zone this colony belongs to (see the dynamic `zones` table).
  @IsOptional()
  @IsInt()
  zone_id?: number;
}

export class UpdateColonyDto extends CreateColonyDto {}
