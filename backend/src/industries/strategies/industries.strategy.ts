import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class IndustriesStrategy {
  canManage(role?: string) {
    return canAccess(role, 'director_admin', 'colony_section', 'industry_admin');
  }
}
