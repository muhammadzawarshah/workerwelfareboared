import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';
import { late_fee_type } from '@prisma/client';

export class CreateRentRateDto {
  @IsOptional()
  @IsInt()
  colony_id?: number;

  @IsOptional()
  @IsInt()
  flat_id?: number;

  @IsOptional()
  @IsString()
  unit_type?: string;

  @IsNumberString()
  amount!: string;

  @IsDateString()
  effective_from!: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;
}

export class UpdateRentRateDto extends CreateRentRateDto {}

export class CreateLateFeeRuleDto {
  @IsString()
  name!: string;

  @IsEnum(late_fee_type)
  fee_type!: late_fee_type;

  @IsNumberString()
  amount!: string;

  @IsOptional()
  @IsInt()
  grace_days?: number;

  @IsOptional()
  @IsNumberString()
  max_fee_amount?: string;

  @IsDateString()
  effective_from!: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateLateFeeRuleDto extends CreateLateFeeRuleDto {}

export class GenerateRentInvoicesDto {
  @IsDateString()
  billing_month!: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsInt()
  colony_id?: number;
}

export class PayRentInvoiceDto {
  @IsNumberString()
  amount!: string;

  @IsDateString()
  payment_date!: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  receipt_no?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
