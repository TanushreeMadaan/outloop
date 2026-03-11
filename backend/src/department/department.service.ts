import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      where: { deletedAt: null },
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
    if (!oldDepartment) {
      throw new NotFoundException('Department not found');
    }

    const anyTransaction = await this.prisma.transaction.findFirst({
      where: {
        departmentId: id,
      },
    });

    if (anyTransaction) {
      throw new BadRequestException('Cannot delete: This department is associated with one or more transactions.');
    }

    const department = await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
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
