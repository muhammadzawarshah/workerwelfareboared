import { IsIn } from 'class-validator';

export class DashboardNameDto {
  @IsIn(['admin', 'industry', 'verification', 'committee', 'colony-section', 'finance', 'caretaker', 'works'])
  name!: string;
}
