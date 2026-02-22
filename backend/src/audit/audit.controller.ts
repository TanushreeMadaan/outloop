import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { QueryAuditDto } from './dto/query-audit.dto';

@Controller('audit-logs')
@Roles(Role.ADMIN)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query: QueryAuditDto) {
    return this.auditService.findAll(query);
  }
}
