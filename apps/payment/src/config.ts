import { env, loadEnvFile } from '@makido/config';

loadEnvFile();

export const config = {
  // Kiosk pages Stripe sends the customer back to. Only a display: the
  // payment status comes from the signed callback, never from these pages
  checkout: {
    cancelUrl: env(
      'PAYMENT_CANCEL_URL',
      'http://localhost:5173/payment/cancel',
    ),
    successUrl: env(
      'PAYMENT_SUCCESS_URL',
      'http://localhost:5173/payment/success',
    ),
    /** Stripe minimum: 30. An unpaid session then expires and the payment fails */
    ttlMinutes: Number(env('PAYMENT_CHECKOUT_TTL_MINUTES', '30')),
  },
  grpcUrl: `0.0.0.0:${env('PAYMENT_GRPC_PORT', '50052')}`,
  mongoUrl: env('MONGO_PAYMENT_URL', 'mongodb://localhost:27018'),
  // No fallback: secrets only come from the environment (.env, never committed)
  stripe: {
    secretKey: env('STRIPE_SECRET_KEY'),
    webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
  },
};
