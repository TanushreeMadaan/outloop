import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { AuditService } from 'src/audit/audit.service';
import { AuditAction, EntityType } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

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

  findAll() {
    return this.prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
