import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaretakerService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  loginAttendance(body: unknown, user?: unknown) { return this.attendanceLogin(body, user as never); }
  logoutAttendance(body: unknown) { return this.attendanceLogoutByBody(body); }
  listAttendance(query: Record<string, unknown>) { return this.list('caretaker-attendance', query); }
  findAttendanceById(id: string) { return this.findOne('caretaker-attendance', id); }
  createGpsPing(body: unknown, user?: unknown) { return this.gpsPing(body, user as never); }
  listGps(query: Record<string, unknown>) { return this.list('caretaker-gps', query); }
  listTasks(query: Record<string, unknown>) { return this.list('caretaker-tasks', query); }
  createTask(body: unknown, user?: unknown) { return this.create('caretaker-tasks', body, user as never); }
  findTaskById(id: string) { return this.findOne('caretaker-tasks', id); }
  updateTask(id: string, body: unknown) { return this.update('caretaker-tasks', id, body); }
  deleteTask(id: string) { return this.remove('caretaker-tasks', id); }
  acceptTask(id: string) { return this.setTaskStatus(id, 'accepted'); }
  startTask(id: string) { return this.setTaskStatus(id, 'in_progress'); }
  completeTask(id: string) { return this.setTaskStatus(id, 'completed'); }
  rejectTask(id: string) { return this.setTaskStatus(id, 'rejected'); }
  uploadProof(taskId: string, body: unknown, user?: unknown) { return this.uploadTaskProof(taskId, body, user as never); }
  findProofs(query: Record<string, unknown>) { return this.list('task-proofs', query); }
  createProof(body: unknown, user?: unknown) { return this.create('task-proofs', body, user as never); }
  approveProof(id: string) { return this.approveTaskProof(id); }
  rejectProof(id: string) { return this.rejectTaskProof(id); }
}
