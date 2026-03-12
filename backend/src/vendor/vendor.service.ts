import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuditService } from 'src/audit/audit.service';
import { AuditAction, EntityType } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) { }

  findAll() {
    return this.prisma.vendor.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).then((vendors) =>
      vendors.map(({ _count, ...vendor }) => ({
        ...vendor,
        canDelete: _count.transactions === 0,
      })),
    );
  }

  async create(data: CreateVendorDto, userId: string) {
    const vendor = await this.prisma.vendor.create({ data });

    await this.auditService.log({
      entityType: EntityType.VENDOR,
      entityId: vendor.id,
      action: AuditAction.CREATE,
      newValue: vendor,
      performedById: userId,
    });

    return vendor;
  }

  async update(id: string, data: UpdateVendorDto, userId: string) {
    const oldVendor = await this.prisma.vendor.findUnique({ where: { id } });
    const vendor = await this.prisma.vendor.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      entityType: EntityType.VENDOR,
      entityId: vendor.id,
      action: AuditAction.UPDATE,
      oldValue: oldVendor as any,
      newValue: vendor as any,
      performedById: userId,
    });

    return vendor;
  }

  async remove(id: string, userId: string) {
    const oldVendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!oldVendor) {
      throw new NotFoundException('Vendor not found');
    }

    const anyTransaction = await this.prisma.transaction.findFirst({
      where: {
        vendorId: id,
      },
    });

    if (anyTransaction) {
      throw new BadRequestException('Cannot delete: This vendor is associated with one or more transactions.');
    }

    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      entityType: EntityType.VENDOR,
      entityId: vendor.id,
      action: AuditAction.DELETE,
      oldValue: oldVendor as any,
      performedById: userId,
    });

    return vendor;
  }
}
