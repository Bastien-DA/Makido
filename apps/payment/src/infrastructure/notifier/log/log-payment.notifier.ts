import { Injectable, Logger } from '@nestjs/common';

import type { Payment } from '../../../domain/payment.js';

import { PaymentNotifier } from '../../../domain/ports/payment-notifier.js';

@Injectable()
export class LogPaymentNotifier extends PaymentNotifier {
  private readonly logger = new Logger(LogPaymentNotifier.name);

  paymentSettled(payment: Payment): Promise<void> {
    this.logger.log(
      `Payment ${payment.id} of order ${payment.orderId} is ${payment.status}`,
    );

    return Promise.resolve();
  }
}
