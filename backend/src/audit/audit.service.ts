import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, EntityType, Prisma } from '@prisma/client';
import { QueryAuditDto } from './dto/query-audit.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }

  async log(params: {
    entityType: EntityType;
    entityId: string;
    action: AuditAction;
    performedById: string;
    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValue: params.oldValue,
        newValue: params.newValue,
        performedById: params.performedById,
      },
    });
  }

  async findAll(query: QueryAuditDto) {
    const orderBy = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    };

    const where: any = {};
    if (query.entityType) {
      where.entityType = query.entityType;
    }
    if (query.entityId) {
      where.entityId = query.entityId;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy,
    });
  }
}
