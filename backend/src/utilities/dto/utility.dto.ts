import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';
import { fetch_attempt_status, utility_type } from '@prisma/client';

export class CreateUtilityConnectionDto {
  @IsInt()
  flat_id!: number;

  @IsEnum(utility_type)
  utility_type!: utility_type;

  @IsOptional()
  @IsString()
  provider_name?: string;

  @IsString()
  consumer_number!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUtilityConnectionDto extends CreateUtilityConnectionDto {}

export class UtilityConnectionStatusDto {
  @IsBoolean()
  is_active!: boolean;
}

export class CreateUtilityBillDto {
  @IsOptional()
  @IsInt()
  utility_connection_id?: number;

  @IsOptional()
  @IsInt()
  flat_assignment_id?: number;

  @IsOptional()
  @IsInt()
  worker_id?: number;

  @IsOptional()
  @IsInt()
  flat_id?: number;

  @IsEnum(utility_type)
  utility_type!: utility_type;

  @IsDateString()
  billing_month!: string;

  @IsNumberString()
  amount!: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}

export class UpdateUtilityBillDto extends CreateUtilityBillDto {}

export class FetchUtilityBillDto {
  @IsInt()
  utility_connection_id!: number;

  @IsDateString()
  billing_month!: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}

export class FetchMonthlyUtilityBillsDto {
  @IsDateString()
  billing_month!: string;

  @IsOptional()
  @IsEnum(utility_type)
  utility_type?: utility_type;
}

export class CreateUtilityPaymentDto {
  @IsInt()
  utility_bill_id!: number;

  @IsNumberString()
  amount!: string;

  @IsDateString()
  payment_date!: string;

  @IsOptional()
  @IsString()
  receipt_no?: string;
}

export class LogUtilityFetchAttemptDto {
  @IsInt()
  utility_connection_id!: number;

  @IsDateString()
  billing_month!: string;

  @IsEnum(fetch_attempt_status)
  status!: fetch_attempt_status;

  @IsOptional()
  @IsString()
  api_response_code?: string;

  @IsOptional()
  @IsString()
  error_message?: string;
}
