import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() body: CreateDepartmentDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.departmentService.create(body, req.user.userId);
  }

  @Get()
  findAll() {
    return this.departmentService.findAll();
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: CreateDepartmentDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.departmentService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.departmentService.remove(id, req.user.userId);
  }
}
