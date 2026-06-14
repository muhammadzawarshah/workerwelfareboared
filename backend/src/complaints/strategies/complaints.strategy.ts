import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class ComplaintsStrategy {
  canAssign(role?: string) {
    // The caretaker is the on-ground colony admin; ADs and works wing oversee.
    return canAccess(
      role,
      'director_admin',
      'care_taker_labour_colony',
      'ad_colonies_zone1',
      'ad_colonies_zone2',
      'works_wing',
    );
  }
}
