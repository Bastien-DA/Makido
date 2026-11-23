import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandController } from './command.controller.js';
import { CommandService } from './command.service.js';
import { databaseOptions } from './database-options.js';
import { DownstreamService } from './downstream.service.js';
import { Article } from './entities/article.entity.js';
import { OrderService } from './order.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...databaseOptions(config),
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([Article]),
  ],
  controllers: [CommandController],
  providers: [CommandService, OrderService, DownstreamService],
})
export class CommandModule {}
