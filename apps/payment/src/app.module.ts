import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { config } from './config.js';
import { PaymentsModule } from './payments/payments.module.js';

/**
 * Root module: one feature module each for the payments, the payment
 * provider and the notifier (the last two in the next commits)
 */
@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl, { dbName: 'payment' }),
    PaymentsModule,
  ],
})
export class AppModule {}
