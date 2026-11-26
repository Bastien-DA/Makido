import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { config } from './config.js';
import { RequestLoggerMiddleware } from './core/request-logger.middleware.js';
import { PaymentService } from './domain/payment.service.js';
import { PaymentNotifier } from './domain/ports/payment-notifier.js';
import { PaymentProvider } from './domain/ports/payment-provider.js';
import { PaymentRepository } from './domain/ports/payment.repository.js';
import { MongoPaymentRepository } from './infrastructure/database/mongo/mongo-payment.repository.js';
import {
  MongoPayment,
  MongoPaymentSchema,
} from './infrastructure/database/mongo/payment.schema.js';
import { LogPaymentNotifier } from './infrastructure/notifier/log/log-payment.notifier.js';
import { StripePaymentProvider } from './infrastructure/provider/stripe/stripe-payment.provider.js';
import { PaymentController } from './presentation/grpc/payment.controller.js';
import { StripeCallbackController } from './presentation/http/stripe-callback.controller.js';

// The only place that picks the implementations: to change database,
// provider or notifier, change its line here. The domain only knows the ports
@Module({
  controllers: [PaymentController, StripeCallbackController],
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
    { provide: PaymentNotifier, useClass: LogPaymentNotifier },
  ],
  
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
