import type { Observable } from 'rxjs';

// TypeScript mirror of proto/payment.proto (fields in camelCase, see the loader options)
export const PAYMENT_SERVICE = 'PaymentService';

export type TransactionStatus =
  'FAILED' | 'PENDING' | 'SUCCEEDED' | 'TRANSACTION_STATUS_UNSPECIFIED';

export interface Transaction {
  amount: number;
  createdAt: string;
  currency: string;
  externalId: string;
  id: string;
  orderId: string;
  status: TransactionStatus;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  /** In cents: 12.50 EUR is 1250 */
  amount: number;
  /** Lowercase ISO 4217 code, the service default when empty */
  currency: string;
  orderId: string;
}

export interface CreateTransactionResponse {
  /** Hosted payment page the kiosk redirects the customer to, never stored */
  redirectUrl: string;
  transaction: Transaction;
}

export interface PaymentServiceClient {
  createTransaction(
    request: CreateTransactionRequest,
  ): Observable<CreateTransactionResponse>;
}
