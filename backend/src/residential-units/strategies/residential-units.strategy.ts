import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class ResidentialUnitsStrategy {
  canManage(role?: string) {
    return canAccess(
      role,
      'director_admin',
      'ad_colonies_zone1',
      'ad_colonies_zone2',
      'colony_section',
      'care_taker_labour_colony',
    );
  }
}
