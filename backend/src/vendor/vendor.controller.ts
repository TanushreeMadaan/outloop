import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) { }

  @Post()
  create(
    @Body() body: CreateVendorDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.vendorService.create(body, req.user.userId);
  }

  @Get()
  getVendors() {
    return this.vendorService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateVendorDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.vendorService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.vendorService.remove(id, req.user.userId);
  }
}
