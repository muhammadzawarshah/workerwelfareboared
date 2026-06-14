import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class CaretakerStrategy {
  canUseMobile(role?: string) {
    return canAccess(
      role,
      'director_admin',
      'care_taker_labour_colony',
      'ad_colonies_zone1',
      'ad_colonies_zone2',
    );
  }
}
