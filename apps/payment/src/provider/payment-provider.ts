import type { FinalStatus } from '../payments/payment.js';

export interface PaymentRequest {
  /** In cents */
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
}

export interface InitiatedPayment {
  externalId: string;
  redirectUrl: string;
}

/** What a provider callback means for one of our payments */
export interface PaymentOutcome {
  externalId: string;
  paymentId: string;
  status: FinalStatus;
}

/** The callback is not signed by the provider: it must be rejected */
export class InvalidCallbackError extends Error {
  override name = 'InvalidCallbackError';
}

export abstract class PaymentProvider {

  abstract findRedirectUrl(externalId: string): Promise<string | undefined>;

  abstract initiatePayment(request: PaymentRequest): Promise<InitiatedPayment>;

  /**
   * Checks the signature of a callback and reads it. `undefined` for an event
   * that does not settle a payment (we receive more than we need).
   * Throws InvalidCallbackError when the signature is wrong
   */
  abstract parseCallback(
    payload: Buffer,
    signature: string,
  ): PaymentOutcome | undefined;
}
