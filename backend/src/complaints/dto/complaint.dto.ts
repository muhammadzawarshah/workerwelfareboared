import { IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateComplaintDto {
  @IsOptional()
  @IsInt()
  worker_id?: number;

  @IsOptional()
  @IsInt()
  colony_id?: number;

  @IsOptional()
  @IsInt()
  flat_id?: number;

  @IsString()
  complaint_desc!: string;
}

export class UpdateComplaintDto extends CreateComplaintDto {}

export class AssignComplaintDto {
  @IsInt()
  assigned_caretaker_id!: number;

  @IsOptional()
  @IsString()
  task_title?: string;
}

export class CreateComplaintBudgetDto {
  @IsInt()
  complaint_id!: number;

  @IsNumberString()
  budget!: string;

  @IsOptional()
  @IsInt()
  document_id?: number;
}

export class UpdateComplaintBudgetDto extends CreateComplaintBudgetDto {}
