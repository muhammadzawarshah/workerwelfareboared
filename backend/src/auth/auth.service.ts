import { ConflictException, Injectable, UnauthorizedException , ForbiddenException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { logindto } from './dto/login.dto';
import { CreateUserByAdminDto } from './dto/adminrole.dto';
import { user_role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtservice: JwtService
    ){}

    async register(dto: RegisterDto){

        const existinguser= await this.prisma.users.findUnique({
            where:{email:dto.email},
        });

        if(existinguser){
            throw new ConflictException('User Already exist');
        };

        const password_hash= await bcrypt.hash(dto.password,10);

        const user= await this.prisma.users.create(
            {
                data:{
                    name:dto.name,
                    email:dto.email,
                    password_hash:password_hash,
                    phone_number:dto.phone_number,
                    profile_photo:dto.profile_photo,
                    role: user_role.care_taker_labour_colony
                },
                select:{
                    id:true,
                    name:true,
                    email:true,
                    phone_number:true,
                    status:true,
                    profile_photo:true,
                    role:true,
                    created_at:true
                }
            }
        );

        return {
        success: true,
        message: 'User registered successfully',
        data: user,
        errors: null,
        };

    }

     async createUserByAdmin(dto: CreateUserByAdminDto, currentUser: any) {
    // Super Admin can create any role. Admin can create any role except Super Admin.
    // Deputy Director (GAHR) handles HR and can create the operational staff roles.
    const allRoles: user_role[] = Object.values(user_role);
    const allowedRolesForAdmin: user_role[] = allRoles.filter((role) => role !== user_role.super_admin);
    const allowedRolesForGahr: user_role[] = [
      user_role.care_taker_labour_colony,
      user_role.colony_section,
      user_role.works_wing,
      user_role.finance_wing,
      user_role.recoveries_rent,
      user_role.legal_section,
      user_role.industry_admin,
    ];

    let allowedRoles: user_role[] = [];

    if (currentUser.role === user_role.super_admin) {
    allowedRoles = allRoles;
    } else if (currentUser.role === user_role.admin) {
    allowedRoles = allowedRolesForAdmin;
    } else if (currentUser.role === user_role.deputy_director_gahr) {
    allowedRoles = allowedRolesForGahr;
    } else {
    throw new ForbiddenException('You are not allowed to create users');
    }

    if (!allowedRoles.includes(dto.role)) {
    throw new ForbiddenException('You cannot create this role');
    }

    const existinguser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existinguser) {
      throw new ConflictException('User already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash,
        phone_number: dto.phone_number,
        profile_photo: dto.profile_photo,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        status: true,
        profile_photo: true,
        role: true,
        created_at: true,
      },
    });

    return {
      success: true,
      message: 'User created successfully',
      data: user,
      errors: null,
    };
  }

  async login(dto : logindto){

    const user= await this.prisma.users.findUnique({
        where:{email:dto.email}
    });

    if(!user){
        throw new UnauthorizedException('Invalid Email Or Password');
    };

    if(user.status=='blocked'){
        throw new UnauthorizedException('your account is blocked');
    }else if(user.status == 'disabled'){
        throw new UnauthorizedException('your account is disabled');
    }

    const passwordisvalid = await bcrypt.compare(dto.password as string, user.password_hash as string);

    if (!passwordisvalid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwtservice.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const caretakerColony = await this.prisma.caretaker_colonies.findFirst({
      where: { user_id: user.id, is_active: true },
      orderBy: { id: 'desc' },
      select: { colony_id: true },
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_photo: user.profile_photo,
          colony_id: caretakerColony?.colony_id ?? null,
        },
      },
      errors: null,
    };
  };

  async getProfile(currentUser: any) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: currentUser.sub,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      profile_photo: true,
      status: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  const caretakerColony = await this.prisma.caretaker_colonies.findFirst({
    where: { user_id: user.id, is_active: true },
    orderBy: { id: 'desc' },
    select: { colony_id: true },
  });

  return {
    success: true,
    message: 'Profile fetched successfully',
    data: { ...user, colony_id: caretakerColony?.colony_id ?? null },
    errors: null,
  };
}

  logout() {
    return {
      success: true,
      message: 'Logout successful',
      data: null,
      errors: null,
    };
  }

  forgotPassword(email: string) {
    return {
      success: true,
      message: 'If this email exists, a reset link will be sent',
      data: { email },
      errors: null,
    };
  }

  resetPassword() {
    return {
      success: true,
      message: 'Password reset endpoint is ready for token provider integration',
      data: null,
      errors: null,
    };
  }

}
