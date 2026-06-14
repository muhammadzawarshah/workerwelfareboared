import { IsEnum, IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';
import { document_owner, document_visibility } from '@prisma/client';

export class CreateDocumentDto {
  @IsInt()
  document_type_id!: number;

  @IsOptional()
  @IsEnum(document_owner)
  owner_type?: document_owner;

  @IsOptional()
  @IsInt()
  owner_id?: number;

  @IsOptional()
  @IsInt()
  application_id?: number;

  @IsString()
  file_path!: string;

  @IsString()
  original_file_name!: string;

  @IsString()
  mime_type!: string;

  @IsOptional()
  @IsNumberString()
  file_size?: string;

  @IsOptional()
  @IsEnum(document_visibility)
  visibility?: document_visibility;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateDocumentDto extends CreateDocumentDto {}

export class VerifyDocumentDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class RejectDocumentDto {
  @IsString()
  rejection_reason!: string;
}

export class DocumentVisibilityDto {
  @IsEnum(document_visibility)
  visibility!: document_visibility;
}

export class CreateDocumentTypeDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  module!: string;

  @IsOptional()
  is_required?: boolean;

  @IsOptional()
  @IsString()
  allowed_file_type?: string;

  @IsOptional()
  @IsInt()
  max_file_size_mb?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(document_visibility)
  default_visibility?: document_visibility;
}

export class UpdateDocumentTypeDto extends CreateDocumentTypeDto {}
