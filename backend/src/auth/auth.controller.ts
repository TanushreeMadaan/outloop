import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { Public } from './public.decorator';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthUser } from './auth-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('register')
  register(@Body() body: { email: string; password: string; role: Role }) {
    return this.authService.register(body.email, body.password, body.role);
  }

  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req: Request & { user: AuthUser }) {
    return req.user;
  }
}
