import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();

    this.$extends({
      query: {
        vendor: {
          async findMany({ args, query }) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
