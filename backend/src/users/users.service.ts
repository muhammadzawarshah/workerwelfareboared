import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) {
    return this.list('users', query);
  }

  findById(id: string) {
    return this.findOne('users', id);
  }

  createNewUser(body: unknown, currentUser?: unknown) {
    return this.create('users', body, currentUser as never);
  }

  updateUser(id: string, body: unknown) {
    return this.update('users', id, body);
  }

  updateUserStatus(id: string, body: unknown) {
    return this.updateStatus('users', id, body);
  }

  deleteUser(id: string) {
    return this.remove('users', id);
  }

  async setProfilePhoto(id: string, file?: { filename: string }) {
    if (!file) {
      throw new BadRequestException('Profile image is required (png, jpg, jpeg or webp, max 5MB)');
    }
    const updated = await this.prisma.users.update({
      where: { id: Number(id) },
      data: { profile_photo: `/uploads/users/${file.filename}` },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        status: true,
        profile_photo: true,
        role: true,
      },
    });
    return { success: true, message: 'Profile photo updated successfully', data: updated, errors: null };
  }
}
