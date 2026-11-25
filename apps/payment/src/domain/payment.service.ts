import { Injectable, Logger } from '@nestjs/common';

import type { NewPayment, Payment } from './payment.js';

import {
  InvalidPaymentError,
  PaymentConflictError,
  ProviderUnavailableError,
} from './payment.errors.js';
import { PaymentProvider } from './ports/payment-provider.js';
import { PaymentRepository } from './ports/payment.repository.js';

const DEFAULT_CURRENCY = 'eur';

export interface CreatedPayment {
  payment: Payment;
  /** The provider's page where the customer pays */
  redirectUrl: string;
}

/**
 * Business rules of a payment. Knows the two ports (storage, provider) but
 * neither Mongo nor Stripe nor gRPC
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly payments: PaymentRepository,
    private readonly provider: PaymentProvider,
  ) {}

  /**
   * Has an order paid. Asked twice for the same order (kiosk reloaded…), it
   * returns the payment already open instead of charging twice
   */
  async createPayment(request: NewPayment): Promise<CreatedPayment> {
    const data = validate(request);

    const pending = await this.payments.findPendingByOrderId(data.orderId);
    if (pending) {
      const resumed = await this.resume(pending, data);
      if (resumed) return resumed;
    }

    return this.initiate(await this.payments.create(data));
  }

  /** Saved first, then sent to the provider: a provider failure leaves a trace */
  private async initiate(payment: Payment): Promise<CreatedPayment> {
    const { amount, currency, id, orderId } = payment;

    let initiated;
    try {
      initiated = await this.provider.initiatePayment({
        amount,
        currency,
        orderId,
        paymentId: id,
      });
    } catch (error) {
      this.logger.error(
        `Payment ${id} could not be initiated: ${message(error)}`,
      );
      await this.payments.finalize(id, 'FAILED');
      throw new ProviderUnavailableError('The payment provider failed');
    }

    const updated = await this.payments.setExternalId(id, initiated.externalId);

    return {
      payment: updated ?? { ...payment, externalId: initiated.externalId },
      redirectUrl: initiated.redirectUrl,
    };
  }

  /** `undefined` when the pending payment is dead and a new one can start */
  private async resume(
    pending: Payment,
    data: NewPayment,
  ): Promise<CreatedPayment | undefined> {
    if (pending.amount !== data.amount || pending.currency !== data.currency) {
      throw new PaymentConflictError(
        `Order ${data.orderId} already has a pending payment of another amount`,
      );
    }

    // Saved but never sent to the provider (crash in between): nobody can pay it
    if (!pending.externalId) {
      await this.payments.finalize(pending.id, 'FAILED');

      return undefined;
    }

    let redirectUrl;
    try {
      redirectUrl = await this.provider.findRedirectUrl(pending.externalId);
    } catch (error) {
      this.logger.error(
        `Payment ${pending.id} could not be resumed: ${message(error)}`,
      );
      throw new ProviderUnavailableError('The payment provider failed');
    }

    // Paid or expired at the provider: its callback decides, not us
    if (!redirectUrl) {
      throw new PaymentConflictError(
        `Order ${data.orderId} has a payment waiting for the provider's answer`,
      );
    }

    return { payment: pending, redirectUrl };
  }
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function validate({ amount, currency, orderId }: NewPayment): NewPayment {
  const cleanOrderId = orderId.trim();
  if (!cleanOrderId) throw new InvalidPaymentError('orderId is required');

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new InvalidPaymentError('amount must be a positive number of cents');
  }

  // Empty is the proto default: the service default applies
  const cleanCurrency = currency.trim().toLowerCase() || DEFAULT_CURRENCY;
  if (!/^[a-z]{3}$/.test(cleanCurrency)) {
    throw new InvalidPaymentError('currency must be an ISO 4217 code');
  }

  return { amount, currency: cleanCurrency, orderId: cleanOrderId };
}
