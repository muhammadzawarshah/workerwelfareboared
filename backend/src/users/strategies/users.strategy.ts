import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class UsersStrategy {
  canAccessAll(role?: string) {
    // Deputy Director (GAHR) handles general admin & HR / user management.
    return canAccess(role, 'director_admin', 'deputy_director_gahr');
  }
}
