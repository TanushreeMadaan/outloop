import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  @Post()
  create(
    @Body() body: CreateItemDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.itemService.create(body, req.user.userId);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateItemDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.itemService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.itemService.remove(id, req.user.userId);
  }
}
