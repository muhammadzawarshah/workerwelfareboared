import { IsDateString, IsEnum, IsInt, IsNumberString, IsOptional, IsString, Matches } from 'class-validator';
import { worker_status, worker_type } from '@prisma/client';

export class CreateWorkerDto {
  @IsString()
  name!: string;

  @IsString()
  father_name!: string;

  @Matches(/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]$/)
  cnic!: string;

  @IsDateString()
  dob!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  essi_no?: string;

  @IsOptional()
  @IsString()
  eobi_no?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsNumberString()
  salary_per_month?: string;

  @IsOptional()
  @IsInt()
  total_duration_service?: number;

  @IsOptional()
  @IsString()
  total_payment_by?: string;

  @IsOptional()
  @IsInt()
  total_number_dependents?: number;

  @IsOptional()
  @IsString()
  mobile_no_1?: string;

  @IsOptional()
  @IsString()
  mobile_no_2?: string;

  @IsOptional()
  @IsEnum(worker_type)
  worker_type?: worker_type;

  @IsOptional()
  @IsEnum(worker_status)
  status?: worker_status;
}

export class UpdateWorkerDto extends CreateWorkerDto {}

export class WorkerStatusDto {
  @IsEnum(worker_status)
  status!: worker_status;
}
