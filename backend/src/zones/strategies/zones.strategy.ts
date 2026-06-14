import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class ZonesStrategy {
  // Zones (and their AD assignment) are governed at the director level and by
  // the Assistant Directors (Colonies) themselves.
  canManage(role?: string) {
    return canAccess(role, 'director_admin', 'ad_colonies_zone1', 'ad_colonies_zone2');
  }
}
