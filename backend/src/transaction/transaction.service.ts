import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTransactionDto) {
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
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          vendorId,
          departmentId,
          isReturnable,
          remarks,
          createdById: 'temp-user-id', // todo: replace after auth
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
