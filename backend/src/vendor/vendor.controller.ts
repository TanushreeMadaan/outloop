import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  create(
    @Body() body: CreateVendorDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.vendorService.create(body, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getVendors() {
    return this.vendorService.findAll();
  }
}
