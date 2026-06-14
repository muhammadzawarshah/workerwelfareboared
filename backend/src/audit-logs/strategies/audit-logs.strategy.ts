import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class AuditLogsStrategy {
  canView(role?: string) {
    return canAccess(role, 'director_admin', 'deputy_director_gahr', 'legal_section');
  }
}
