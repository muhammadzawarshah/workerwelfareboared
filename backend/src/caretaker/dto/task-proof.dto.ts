import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskProofDto {
  @IsInt()
  task_id!: number;

  @IsOptional()
  @IsInt()
  image_document_id?: number;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
