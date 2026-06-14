import { Body, Controller, Post, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserByAdminDto } from './dto/adminrole.dto'
import { logindto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('register')
    register(@Body() dto:RegisterDto){
        return this.authService.register(dto);
    }

    @Post('createUserByAdmin')
    @UseGuards(JwtAuthGuard)
    createUserByAdmin(@Body() dto:CreateUserByAdminDto, @Req() req:any){
        return this.authService.createUserByAdmin(dto, req.user);
    }

    @Post('login')
    login(@Body() dto:logindto){
        return this.authService.login(dto)
    }

     @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: any) {
        return this.authService.getProfile(req.user);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Req() req: any) {
        return this.authService.getProfile(req.user);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout() {
        return this.authService.logout();
    }

    @Post('forgot-password')
    forgotPassword(@Body('email') email:string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    resetPassword() {
        return this.authService.resetPassword();
    }
}
