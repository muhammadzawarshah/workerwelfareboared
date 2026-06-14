import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardStrategy {
  canView(role?: string) {
    return Boolean(role);
  }
}
