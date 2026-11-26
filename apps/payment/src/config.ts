import { env, loadEnvFile } from '@makido/config';

loadEnvFile();

export const config = {
  checkout: {
    cancelUrl: env(
      'PAYMENT_CANCEL_URL',
      'http://localhost:5173/payment/cancel',
    ),
    successUrl: env(
      'PAYMENT_SUCCESS_URL',
      'http://localhost:5173/payment/success',
    ),
    ttlMinutes: Number(env('PAYMENT_CHECKOUT_TTL_MINUTES', '30')),
  },
  grpcUrl: `0.0.0.0:${env('PAYMENT_GRPC_PORT', '50052')}`,
  httpPort: Number(env('PAYMENT_HTTP_PORT', '3002')),
  mongoUrl: env('MONGO_PAYMENT_URL', 'mongodb://localhost:27018'),
  stripe: {
    secretKey: env('STRIPE_SECRET_KEY'),
    webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
  },
};
