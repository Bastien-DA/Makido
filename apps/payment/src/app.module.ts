import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { config } from './config.js';
import { PaymentService } from './domain/payment.service.js';
import { PaymentProvider } from './domain/ports/payment-provider.js';
import { PaymentRepository } from './domain/ports/payment.repository.js';
import { MongoPaymentRepository } from './infrastructure/database/mongo/mongo-payment.repository.js';
import {
  MongoPayment,
  MongoPaymentSchema,
} from './infrastructure/database/mongo/payment.schema.js';
import { StripePaymentProvider } from './infrastructure/provider/stripe/stripe-payment.provider.js';
import { PaymentController } from './presentation/grpc/payment.controller.js';

// The only place that picks the implementations: to change database or
// provider, change its line here. The domain only knows the ports
@Module({
  controllers: [PaymentController],
  imports: [
    MongooseModule.forRoot(config.mongoUrl, { dbName: 'payment' }),
    MongooseModule.forFeature([
      { name: MongoPayment.name, schema: MongoPaymentSchema },
    ]),
  ],
  providers: [
    PaymentService,
    { provide: PaymentRepository, useClass: MongoPaymentRepository },
    { provide: PaymentProvider, useClass: StripePaymentProvider },
  ],
})
export class AppModule {}
