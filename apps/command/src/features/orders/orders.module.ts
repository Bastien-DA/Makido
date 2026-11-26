import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GrpcClientsModule, TicketGrpcClient } from '../../core/grpc/index.js';
import { Order } from './entities/order.entity.js';
import { OrderCounter } from './entities/order-counter.entity.js';
import { OrdersController } from './presentation/orders.controller.js';
import { ordersProviders } from './di/orders.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderCounter]), GrpcClientsModule],
  controllers: [OrdersController],
  providers: [...ordersProviders, TicketGrpcClient],
})
export class OrdersModule {}
