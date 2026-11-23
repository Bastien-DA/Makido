import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { config } from './config.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ProviderModule } from './provider/provider.module.js';

/**
 * Root module: one feature module each for the payments, the payment
 * provider and the notifier (the last one in a next commit)
 */
@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl, { dbName: 'payment' }),
    PaymentsModule,
    ProviderModule,
  ],
})
export class AppModule {}
