import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDepartmentDto) {
    return this.prisma.department.create({
      data,
    });
  }

  findAll() {
    return this.prisma.department.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
