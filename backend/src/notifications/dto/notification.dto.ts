import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { recipient_type } from '@prisma/client';

export class CreateNotificationDto {
  @IsEnum(recipient_type)
  recipient_type!: recipient_type;

  @IsInt()
  recipient_id!: number;

  @IsOptional()
  @IsInt()
  application_id?: number;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  notification_type?: string;
}
