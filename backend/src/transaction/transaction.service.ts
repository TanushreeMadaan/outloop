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
import { AuthUser } from '../auth/auth-user.interface';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) { }

  private deriveLifecycleState(params: {
    isReturnable: boolean;
    expectedReturnDate?: string | Date | null;
    actualReturnDate?: string | Date | null;
  }) {
    const expectedReturnDate = params.isReturnable
      ? params.expectedReturnDate ?? null
      : null;
    const actualReturnDate = params.isReturnable
      ? params.actualReturnDate ?? null
      : null;

    return {
      expectedReturnDate,
      actualReturnDate,
      status: params.isReturnable && !actualReturnDate ? 'ACTIVE' : 'COMPLETED',
    } as const;
  }

  async create(data: CreateTransactionDto, userId: string) {
    const { vendorId, departmentId, itemIds, isReturnable, remarks, expectedReturnDate } = data;
    const lifecycle = this.deriveLifecycleState({
      isReturnable,
      expectedReturnDate,
    });

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
          status: lifecycle.status,
          remarks,
          expectedReturnDate: lifecycle.expectedReturnDate,
          actualReturnDate: lifecycle.actualReturnDate,
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
      const nextIsReturnable = data.isReturnable ?? existing.isReturnable;
      const lifecycle = this.deriveLifecycleState({
        isReturnable: nextIsReturnable,
        expectedReturnDate:
          data.expectedReturnDate !== undefined
            ? data.expectedReturnDate
            : existing.expectedReturnDate,
        actualReturnDate: existing.actualReturnDate,
      });

      const transaction = await tx.transaction.update({
        where: { id },
        data: {
          ...otherData,
          isReturnable: nextIsReturnable,
          expectedReturnDate: lifecycle.expectedReturnDate,
          actualReturnDate: lifecycle.actualReturnDate,
          status: lifecycle.status,
        },
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

  async markAsReturned(id: string, actualReturnDate: Date, userId: string) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Transaction not found');
    if (!existing.isReturnable) throw new BadRequestException('Only returnable transactions can be marked as returned');

    const lifecycle = this.deriveLifecycleState({
      isReturnable: existing.isReturnable,
      expectedReturnDate: existing.expectedReturnDate,
      actualReturnDate,
    });

    const result = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: lifecycle.status,
        actualReturnDate: lifecycle.actualReturnDate,
      },
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
    throw new BadRequestException('Transactions cannot be deleted.');
  }

  async findAll(query: QueryTransactionDto, user: AuthUser) {
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

    if (user.role !== 'ADMIN') {
      if (!user.departmentId) {
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }

      where.departmentId = user.departmentId;
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
