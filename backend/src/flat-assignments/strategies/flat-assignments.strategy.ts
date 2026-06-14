import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class FlatAssignmentsStrategy {
  canAssign(role?: string) {
    return canAccess(
      role,
      'director_admin',
      'ad_colonies_zone1',
      'ad_colonies_zone2',
      'colony_section',
      'secretary_kp_wwb',
      'chairman_kp_wwb',
    );
  }
}
