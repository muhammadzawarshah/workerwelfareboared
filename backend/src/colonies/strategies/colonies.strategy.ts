import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class ColoniesStrategy {
  canManage(role?: string) {
    // Assistant Directors (Colonies) control all colonies in their zone.
    return canAccess(role, 'director_admin', 'ad_colonies_zone1', 'ad_colonies_zone2', 'colony_section');
  }
}
