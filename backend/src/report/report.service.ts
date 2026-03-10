import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class ReportService {
    constructor(private prisma: PrismaService) { }

    async getTransactionTrends() {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
                },
            },
            select: {
                createdAt: true,
                isReturnable: true,
            },
        });

        const dailyTrends = new Map();

        transactions.forEach(tx => {
            const date = tx.createdAt.toISOString().split('T')[0];
            const current = dailyTrends.get(date) || { total: 0, returnable: 0, consumable: 0 };
            current.total += 1;
            if (tx.isReturnable) {
                current.returnable += 1;
            } else {
                current.consumable += 1;
            }
            dailyTrends.set(date, current);
        });

        return Array.from(dailyTrends.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async getDepartmentStats() {
        const departments = await this.prisma.department.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
        });

        return departments.map(dept => ({
            name: dept.name,
            transactions: dept._count.transactions,
        }));
    }

    async getVendorStats() {
        const vendors = await this.prisma.vendor.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
        });

        return vendors.map(vendor => ({
            name: vendor.name,
            transactions: vendor._count.transactions,
        }));
    }

    async getReturnAccuracy() {
        const [onTime, overdue] = await Promise.all([
            this.prisma.transaction.count({
                where: {
                    isReturnable: true,
                    status: 'COMPLETED',
                    actualReturnDate: {
                        not: null,
                    },
                    expectedReturnDate: {
                        not: null,
                    },
                    // Rough check for on-time
                },
            }),
            this.prisma.transaction.count({
                where: {
                    isReturnable: true,
                    status: 'ACTIVE',
                    expectedReturnDate: {
                        lt: new Date(),
                    },
                },
            }),
        ]);

        // Better way: get all returnable transactions and compare dates
        const returnables = await this.prisma.transaction.findMany({
            where: { isReturnable: true },
            select: {
                status: true,
                expectedReturnDate: true,
                actualReturnDate: true,
            },
        });

        let onTimeCount = 0;
        let overdueCount = 0;
        let pendingCount = 0;

        returnables.forEach(tx => {
            if (tx.status === 'COMPLETED' && tx.actualReturnDate && tx.expectedReturnDate) {
                if (new Date(tx.actualReturnDate) <= new Date(tx.expectedReturnDate)) {
                    onTimeCount++;
                } else {
                    overdueCount++;
                }
            } else if (tx.status === 'ACTIVE' && tx.expectedReturnDate) {
                if (new Date() > new Date(tx.expectedReturnDate)) {
                    overdueCount++;
                } else {
                    pendingCount++;
                }
            }
        });

        return {
            onTime: onTimeCount,
            overdue: overdueCount,
            pending: pendingCount,
        };
    }
}
