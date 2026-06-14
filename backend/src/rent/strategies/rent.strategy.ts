import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class RentStrategy {
  canManage(role?: string) {
    // Caretaker collects rent on the ground; recoveries/rent + finance reconcile.
    return canAccess(role, 'director_admin', 'finance_wing', 'recoveries_rent', 'care_taker_labour_colony');
  }
}
