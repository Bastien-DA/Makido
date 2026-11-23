import { env, loadEnvFile } from '@makido/config';

loadEnvFile();

export const config = {
  grpcUrl: `0.0.0.0:${env('PAYMENT_GRPC_PORT', '50052')}`,
  mongoUrl: env('MONGO_PAYMENT_URL', 'mongodb://localhost:27018'),
};
