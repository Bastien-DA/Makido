import type { Observable } from 'rxjs';

// TypeScript mirror of proto/payment.proto (fields in camelCase, see the loader options)
export const PAYMENT_SERVICE = 'PaymentService';

export type PaymentStatus =
  'FAILED' | 'PAYMENT_STATUS_UNSPECIFIED' | 'PENDING' | 'SUCCEEDED';

export interface Payment {
  amount: number;
  createdAt: string;
  currency: string;
  externalId: string;
  id: string;
  orderId: string;
  status: PaymentStatus;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  /** In cents: 12.50 EUR is 1250 */
  amount: number;
  /** Lowercase ISO 4217 code, the service default when empty */
  currency: string;
  orderId: string;
}

export interface CreatePaymentResponse {
  payment: Payment;
  /** Hosted payment page the kiosk redirects the customer to, never stored */
  redirectUrl: string;
}

export interface PaymentServiceClient {
  createPayment(
    request: CreatePaymentRequest,
  ): Observable<CreatePaymentResponse>;
}
