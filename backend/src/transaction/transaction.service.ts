import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType } from '@prisma/client';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) { }

  async create(data: CreateTransactionDto, userId: string) {
    const { vendorId, departmentId, itemIds, isReturnable, remarks } = data;

    // Validating vendor
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    // Validating department
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) throw new NotFoundException('Department not found');

    // Validating items
    const items = await this.prisma.item.findMany({
      where: { id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException('One or more items are invalid');
    }

    // Atomic transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          vendorId,
          departmentId,
          isReturnable,
          remarks,
          createdById: userId,
        },
      });

      const transactionItems = itemIds.map((itemId) => ({
        transactionId: transaction.id,
        itemId,
      }));

      await tx.transactionItem.createMany({
        data: transactionItems,
      });

      return transaction;
    });

    await this.auditService.log({
      entityType: EntityType.TRANSACTION,
      entityId: result.id,
      action: AuditAction.CREATE,
      newValue: result,
      performedById: userId,
    });

    return result;
  }

  async update(id: string, data: UpdateTransactionDto, userId: string) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) throw new NotFoundException('Transaction not found');

    const result = await this.prisma.$transaction(async (tx) => {
      const { itemIds, ...otherData } = data;

      const transaction = await tx.transaction.update({
        where: { id },
        data: otherData,
      });

      if (itemIds) {
        // Simple strategy: delete all and recreate
        await tx.transactionItem.deleteMany({
          where: { transactionId: id },
        });

        await tx.transactionItem.createMany({
          data: itemIds.map((itemId) => ({
            transactionId: id,
            itemId,
          })),
        });
      }

      return tx.transaction.findUnique({
        where: { id },
        include: { items: true },
      });
    });

    await this.auditService.log({
      entityType: EntityType.TRANSACTION,
      entityId: id,
      action: AuditAction.UPDATE,
      oldValue: existing as any,
      newValue: result as any,
      performedById: userId,
    });

    return result;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Transaction not found');

    return this.prisma.$transaction(async (tx) => {
      // First delete transaction items
      await tx.transactionItem.deleteMany({
        where: { transactionId: id },
      });

      const transaction = await tx.transaction.delete({
        where: { id },
      });

      await this.auditService.log({
        entityType: EntityType.TRANSACTION,
        entityId: id,
        action: AuditAction.DELETE,
        oldValue: existing as any,
        performedById: userId,
      });

      return transaction;
    });
  }

  async findAll(query: QueryTransactionDto) {
    const {
      page = 1,
      limit = 10,
      isReturnable,
      vendorId,
      departmentId,
    } = query;

    const skip = (page - 1) * limit;

    const orderBy = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    };

    const where: Record<string, unknown> = {};

    if (isReturnable !== undefined) {
      where.isReturnable = isReturnable;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          vendor: true,
          department: true,
          items: {
            include: { item: true },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
