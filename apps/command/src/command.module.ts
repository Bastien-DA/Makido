import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseOptions } from './core/database/database-options.js';
import { GrpcClientsModule } from './core/grpc/index.js';
import { ArticlesModule } from './features/articles/articles.module.js';
import { OrdersModule } from './features/orders/orders.module.js';

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
    GrpcClientsModule,
    ArticlesModule,
    OrdersModule,
  ],
})
export class CommandModule {}
