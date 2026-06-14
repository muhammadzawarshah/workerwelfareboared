import { Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Injectable()
export class ColoniesGuard extends JwtAuthGuard {}
