import { Body, Controller, Get, Post } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('departments')
@Roles(Role.ADMIN)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(@Body() body: CreateDepartmentDto) {
    return this.departmentService.create(body);
  }

  @Get()
  findAll() {
    return this.departmentService.findAll();
  }
}
