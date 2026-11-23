import { Module } from '@nestjs/common';

import { PaymentProvider } from './payment-provider.js';
import { StripePaymentProvider } from './stripe/stripe-payment.provider.js';

@Module({
  exports: [PaymentProvider],
  providers: [{ provide: PaymentProvider, useClass: StripePaymentProvider }],
})
export class ProviderModule {}
