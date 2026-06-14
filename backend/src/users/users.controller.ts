import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersGuard } from './guards/users.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(UsersGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: ListQueryDto) {
    return this.usersService.findAll(query as Record<string, unknown>);
  }

  @Post()
  create(@Body() body: CreateUserDto, @Req() req: { user?: unknown }) {
    return this.usersService.createNewUser(body, req.user);
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (_req, file, cb) => {
          const ext = (extname(file.originalname) || '.jpg').toLowerCase();
          cb(null, `user-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)),
    }),
  )
  uploadPhoto(@Param('id') id: string, @UploadedFile() file?: { filename: string }) {
    return this.usersService.setProfilePhoto(id, file);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.usersService.updateUser(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: unknown) {
    return this.usersService.updateUserStatus(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
