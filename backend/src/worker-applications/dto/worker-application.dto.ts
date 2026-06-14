import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { application_type, committee_decision, verification_status } from '@prisma/client';

export class CreateWorkerApplicationDto {
  @IsInt()
  worker_id!: number;

  @IsOptional()
  @IsInt()
  industry_id?: number;

  @IsEnum(application_type)
  application_type!: application_type;

  @IsOptional()
  @IsInt()
  requested_colony_id?: number;

  @IsOptional()
  @IsString()
  requested_unit_type?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateWorkerApplicationDto extends CreateWorkerApplicationDto {}

export class VerifyApplicationDto {
  @IsEnum(verification_status)
  verification_status!: verification_status;

  @IsOptional()
  @IsString()
  verification_remarks?: string;
}

export class DecideApplicationDto {
  @IsOptional()
  @IsEnum(committee_decision)
  committee_decision?: committee_decision;

  @IsOptional()
  @IsString()
  committee_remarks?: string;

  @IsOptional()
  @IsString()
  allotment_order_no?: string;

  @IsOptional()
  @IsDateString()
  committee_decision_date?: string;
}

export class RejectApplicationDto {
  @IsString()
  rejected_reason!: string;
}
