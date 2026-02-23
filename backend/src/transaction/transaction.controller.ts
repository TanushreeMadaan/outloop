import { Body, Controller, Get, Post, Query, UseGuards, Req, Patch, Delete, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  create(
    @Body() body: CreateTransactionDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.transactionService.create(body, req.user.userId);
  }

  @Get()
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionService.findAll(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.transactionService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.transactionService.remove(id, req.user.userId);
  }
}
