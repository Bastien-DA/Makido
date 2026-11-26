import { Body, Controller, Post } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { OrdersService, type FinalizeCommandRequest } from '../domain/services/orders.service.js';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @GrpcMethod('CommandService', 'FinalizeCommand')
  finalizeCommand(data: FinalizeCommandRequest) {
    return this.ordersService.finalize(data);
  }

  @Post('/webhooks/payment-confirmed')
  paymentConfirmed(
    @Body() data: { reference: string; createdAtUtc: string },
  ) {
    return this.ordersService.confirmPayment(data.reference, data.createdAtUtc);
  }
}
