import type { Payment } from '../payment.js';

/**
 * Notifier port: tells the order service that a payment is settled
 * (SUCCEEDED or FAILED). Called once per payment, when it becomes final
 */
export abstract class PaymentNotifier {
  abstract paymentSettled(payment: Payment): Promise<void>;
}
