import { Injectable } from '@nestjs/common';
import { canAccess } from '../../common/roles/roles.util';

@Injectable()
export class DocumentsStrategy {
  canVerify(role?: string) {
    return canAccess(role, 'director_admin', 'colony_section');
  }
}
