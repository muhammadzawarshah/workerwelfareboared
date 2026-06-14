import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { coerceData, response } from '../common/helpers/resource.helpers';
import { PrismaService } from '../prisma/prisma.service';

type AuthUser = { sub?: number; id?: number };

@Injectable()
export class EvictionsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  private authUserId(user?: AuthUser): number | undefined {
    return user?.sub ?? user?.id;
  }

  async createHearing(body: unknown, user?: AuthUser) {
    const data = coerceData(body);
    const caseId = Number(data.eviction_case_id);
    if (!caseId) throw new BadRequestException('eviction_case_id is required');
    if (!data.hearing_date) throw new BadRequestException('hearing_date is required');

    const prisma = this.prisma as unknown as {
      $transaction<T>(fn: (tx: Record<string, any>) => Promise<T>): Promise<T>;
    };
    const created = await prisma.$transaction(async (tx) => {
      const hearing = await tx.eviction_hearings.create({
        data: {
          ...data,
          eviction_case_id: caseId,
          document_id: data.document_id ? Number(data.document_id) : undefined,
          created_by: this.authUserId(user),
        },
      });
      await tx.eviction_cases.update({
        where: { id: caseId },
        data: {
          next_hearing_date: data.next_hearing_date,
          decision_summary: data.decision_summary,
          status: data.status ?? (data.next_hearing_date ? 'hearing_pending' : 'order_received'),
        },
      });
      return hearing;
    });
    return response('Eviction hearing saved successfully', created);
  }
}
