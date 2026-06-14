import { IsDateString, IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateFlatAssignmentDto {
  @IsInt()
  worker_id!: number;

  @IsInt()
  flat_id!: number;

  @IsOptional()
  @IsInt()
  application_id?: number;

  @IsDateString()
  start_date!: string;

  @IsOptional()
  @IsString()
  allotment_order_no?: string;

  @IsOptional()
  @IsDateString()
  allotment_order_date?: string;

  @IsNumberString()
  rent_amount!: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateFlatAssignmentDto extends CreateFlatAssignmentDto {}

export class VacateFlatDto {
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  vacated_reason?: string;
}

export class TransferFlatDto {
  @IsInt()
  new_flat_id!: number;

  @IsOptional()
  @IsInt()
  application_id?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
