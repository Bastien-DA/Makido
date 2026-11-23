import type { FinalStatus, NewPayment, Payment } from './payment.js';

export abstract class PaymentRepository {
  abstract create(data: NewPayment): Promise<Payment>;

  abstract findById(id: string): Promise<Payment | undefined>;

  abstract findPendingByOrderId(orderId: string): Promise<Payment | undefined>;

  abstract finalize(
    id: string,
    status: FinalStatus,
  ): Promise<Payment | undefined>;

  abstract setExternalId(
    id: string,
    externalId: string,
  ): Promise<Payment | undefined>;
}
