import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuditService } from 'src/audit/audit.service';
import { AuditAction, EntityType } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) { }

  async create(data: CreateItemDto, userId: string) {
    const item = await this.prisma.item.create({ data });

    await this.auditService.log({
      entityType: EntityType.ITEM,
      entityId: item.id,
      action: AuditAction.CREATE,
      newValue: item,
      performedById: userId,
    });

    return item;
  }

  findAll() {
    return this.prisma.item.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            transactionItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).then((items) =>
      items.map(({ _count, ...item }) => ({
        ...item,
        canDelete: _count.transactionItems === 0,
      })),
    );
  }

  async update(id: string, data: UpdateItemDto, userId: string) {
    const existing = await this.prisma.item.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    const item = await this.prisma.item.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      entityType: EntityType.ITEM,
      entityId: item.id,
      action: AuditAction.UPDATE,
      oldValue: existing as any,
      newValue: item as any,
      performedById: userId,
    });

    return item;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.item.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    const anyTransaction = await this.prisma.transaction.findFirst({
      where: {
        items: { some: { itemId: id } },
      },
    });

    if (anyTransaction) {
      throw new BadRequestException('Cannot delete: This item is associated with one or more transactions.');
    }

    const item = await this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      entityType: EntityType.ITEM,
      entityId: item.id,
      action: AuditAction.DELETE,
      oldValue: existing as any,
      performedById: userId,
    });

    return item;
  }
}
