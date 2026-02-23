import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) { }

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
