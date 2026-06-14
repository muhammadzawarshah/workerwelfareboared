import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class AssetsStrategy {
  canManage(role?: string) {
    return canAccess(role, 'director_admin', 'works_wing');
  }
}
