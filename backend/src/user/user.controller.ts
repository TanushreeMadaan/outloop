import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { EntityType, AuditAction } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(
        private userService: UserService,
        private auditService: AuditService,
    ) { }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.userService.findAll();
    }

    @Post()
    @Roles(Role.ADMIN)
    async create(@Body() body: { email: string; password: string; role: Role; departmentId?: string }, @Req() req: any) {
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = await this.userService.createUser(body.email, hashedPassword, body.role, body.departmentId);

        await this.auditService.log({
            entityType: EntityType.USER,
            entityId: user.id,
            action: AuditAction.CREATE,
            performedById: req.user.userId,
            newValue: { email: user.email, role: user.role, departmentId: (user as any).departmentId },
        });

        return user;
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    async update(@Param('id') id: string, @Body() body: { email?: string; password?: string; role?: Role; departmentId?: string }, @Req() req: any) {
        const oldUser = await this.userService.findById(id);
        const updateData: any = { ...body };
        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        }
        const user = await this.userService.updateUser(id, updateData);

        await this.auditService.log({
            entityType: EntityType.USER,
            entityId: id,
            action: AuditAction.UPDATE,
            performedById: req.user.userId,
            oldValue: { email: oldUser?.email, role: oldUser?.role, departmentId: (oldUser as any)?.departmentId },
            newValue: { email: user.email, role: user.role, departmentId: (user as any).departmentId },
        });

        return user;
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    async remove(@Param('id') id: string, @Req() req: any) {
        const user = await this.userService.remove(id);

        await this.auditService.log({
            entityType: EntityType.USER,
            entityId: id,
            action: AuditAction.DELETE,
            performedById: req.user.userId,
        });

        return user;
    }

    @Patch(':id/password')
    async changePassword(
        @Param('id') id: string,
        @Body() body: { password: string },
        @Req() req: Request & { user: AuthUser }
    ) {
        // Users can change their own password, or Admins can change anyone's
        if (req.user.role !== Role.ADMIN && req.user.userId !== id) {
            throw new Error('Unauthorized');
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        return this.userService.updateUser(id, { password: hashedPassword });
    }
}
