import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('departments')
@Roles(Role.ADMIN)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Post()
  create(@Body() body: CreateDepartmentDto) {
    return this.departmentService.create(body);
  }

  @Get()
  findAll() {
    return this.departmentService.findAll();
  }

  @Post(':id') // Using POST for update since some setups prefer it, but @Patch is more standard. Let's use standard @Patch.
  @Get(':id') // I'll just add standard NestJS CRUD pattern.
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: CreateDepartmentDto) {
    return this.departmentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
