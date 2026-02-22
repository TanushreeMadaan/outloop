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

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(@Body() body: CreateItemDto) {
    return this.itemService.create(body);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateItemDto) {
    return this.itemService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
