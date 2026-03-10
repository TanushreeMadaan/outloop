import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createUser(email: string, password: string, role: Role, departmentId?: string) {
    return this.prisma.user.create({
      data: {
        email,
        password,
        role,
        departmentId: departmentId || null,
      },
      include: { department: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async updateUser(id: string, data: { email?: string; password?: string; role?: Role; departmentId?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
