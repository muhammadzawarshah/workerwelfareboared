import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class WorkersStrategy {
  canManage(role?: string) {
    return canAccess(
      role,
      'director_admin',
      'colony_section',
      'industry_admin',
      'care_taker_labour_colony',
    );
  }
}
