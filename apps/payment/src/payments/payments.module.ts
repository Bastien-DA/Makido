import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoPaymentRepository } from './mongo/mongo-payment.repository.js';
import { MongoPayment, MongoPaymentSchema } from './mongo/payment.schema.js';
import { PaymentRepository } from './payment.repository.js';

@Module({
  exports: [PaymentRepository],
  imports: [
    MongooseModule.forFeature([
      { name: MongoPayment.name, schema: MongoPaymentSchema },
    ]),
  ],
  providers: [{ provide: PaymentRepository, useClass: MongoPaymentRepository }],
})
export class PaymentsModule {}
