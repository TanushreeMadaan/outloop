import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getSummary() {
    const [
      totalTransactions,
      returnableCount,
      nonReturnableCount,
      totalVendors,
      totalDepartments,
      totalItems,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { isReturnable: true } }),
      this.prisma.transaction.count({ where: { isReturnable: false } }),
      this.prisma.vendor.count(),
      this.prisma.department.count(),
      this.prisma.item.count(),
      this.prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: true,
          department: true,
          items: {
            include: { item: true },
          },
        },
      }),
    ]);

    return {
      totalTransactions,
      returnableCount,
      nonReturnableCount,
      totalVendors,
      totalDepartments,
      totalItems,
      recentTransactions,
    };
  }
}
