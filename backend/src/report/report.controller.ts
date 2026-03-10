import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportController {
    constructor(private reportService: ReportService) { }

    @Get('transaction-trends')
    getTransactionTrends() {
        return this.reportService.getTransactionTrends();
    }

    @Get('department-stats')
    getDepartmentStats() {
        return this.reportService.getDepartmentStats();
    }

    @Get('vendor-stats')
    getVendorStats() {
        return this.reportService.getVendorStats();
    }

    @Get('return-accuracy')
    getReturnAccuracy() {
        return this.reportService.getReturnAccuracy();
    }

    @Get('dashboard-charts')
    async getDashboardCharts() {
        const [trends, accuracy] = await Promise.all([
            this.reportService.getTransactionTrends(),
            this.reportService.getReturnAccuracy(),
        ]);
        return { trends, accuracy };
    }
}
