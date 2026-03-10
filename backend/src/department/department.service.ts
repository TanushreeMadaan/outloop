import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) { }

  async create(data: CreateDepartmentDto, userId: string) {
    const department = await this.prisma.department.create({
      data,
    });

    await this.auditService.log({
      entityType: EntityType.DEPARTMENT,
      entityId: department.id,
      action: AuditAction.CREATE,
      newValue: department,
      performedById: userId,
    });

    return department;
  }

  findAll() {
    return this.prisma.department.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: { name: string }, userId: string) {
    const oldDepartment = await this.prisma.department.findUnique({ where: { id } });
    const department = await this.prisma.department.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      entityType: EntityType.DEPARTMENT,
      entityId: department.id,
      action: AuditAction.UPDATE,
      oldValue: oldDepartment as any,
      newValue: department as any,
      performedById: userId,
    });

    return department;
  }

  async remove(id: string, userId: string) {
    const oldDepartment = await this.prisma.department.findUnique({ where: { id } });
    const department = await this.prisma.department.delete({
      where: { id },
    });

    await this.auditService.log({
      entityType: EntityType.DEPARTMENT,
      entityId: department.id,
      action: AuditAction.DELETE,
      oldValue: oldDepartment as any,
      performedById: userId,
    });

    return department;
  }
}
