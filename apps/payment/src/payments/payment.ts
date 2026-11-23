export type PaymentStatus = 'FAILED' | 'PENDING' | 'SUCCEEDED';

export type FinalStatus = Exclude<PaymentStatus, 'PENDING'>;

export interface Payment {
  /** In cents: 12.50 EUR is 1250 */
  amount: number;
  createdAt: Date;
  /** Lowercase ISO 4217 code ("eur") */
  currency: string;
  /** The payment id at the provider, set once the payment is initiated */
  externalId?: string;
  id: string;
  orderId: string;
  status: PaymentStatus;
  updatedAt: Date;
}

export type NewPayment = Pick<Payment, 'amount' | 'currency' | 'orderId'>;
