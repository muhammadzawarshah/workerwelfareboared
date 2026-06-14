import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class WorkerApplicationsStrategy {
  canDecide(role?: string) {
    // Registration/allotment chain: caretaker -> AD colonies -> committee
    // (secretary/chairman). Colony section handles verification; industries apply.
    return canAccess(
      role,
      'director_admin',
      'industry_admin',
      'colony_section',
      'care_taker_labour_colony',
      'ad_colonies_zone1',
      'ad_colonies_zone2',
      'secretary_kp_wwb',
      'chairman_kp_wwb',
    );
  }
}
