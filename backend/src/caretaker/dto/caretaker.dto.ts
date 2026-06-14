import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class AttendanceLoginDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsDateString()
  duty_date?: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}

export class AttendanceLogoutDto {
  @IsInt()
  attendance_id!: number;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}

export class GpsPingDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsInt()
  attendance_id?: number;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsInt()
  battery_level?: number;

  @IsOptional()
  @IsBoolean()
  is_mock_location?: boolean;
}

export class CreateCaretakerTaskDto {
  @IsOptional()
  @IsInt()
  asset_id?: number;

  @IsOptional()
  @IsInt()
  complaint_id?: number;

  @IsOptional()
  @IsInt()
  flat_id?: number;

  @IsOptional()
  @IsInt()
  assigned_to_user_id?: number;

  @IsString()
  task_title!: string;

  @IsOptional()
  @IsString()
  task_description?: string;

  @IsOptional()
  @IsNumber()
  target_latitude?: number;

  @IsOptional()
  @IsNumber()
  target_longitude?: number;

  @IsOptional()
  @IsInt()
  allowed_radius_meters?: number;

  @IsOptional()
  @IsDateString()
  due_at?: string;
}

export class UpdateCaretakerTaskDto extends CreateCaretakerTaskDto {}
