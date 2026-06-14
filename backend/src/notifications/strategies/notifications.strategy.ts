import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class NotificationsStrategy {
  canSend(role?: string) {
    return canAccess(
      role,
      'director_admin',
      'secretary_kp_wwb',
      'chairman_kp_wwb',
      'colony_section',
      'ad_colonies_zone1',
      'ad_colonies_zone2',
      'care_taker_labour_colony',
    );
  }
}
