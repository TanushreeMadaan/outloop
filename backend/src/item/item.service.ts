import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateItemDto) {
    return this.prisma.item.create({ data });
  }

  findAll() {
    return this.prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateItemDto) {
    const existing = await this.prisma.item.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.item.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.item.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.item.delete({
      where: { id },
    });
  }
}
