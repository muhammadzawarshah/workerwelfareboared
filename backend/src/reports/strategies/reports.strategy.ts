import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class ReportsStrategy {
  canExport(role?: string) {
    return canAccess(role, 'director_admin', 'finance_wing', 'recoveries_rent');
  }
}
