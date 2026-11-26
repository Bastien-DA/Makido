import type { MicroserviceOptions } from '@nestjs/microservices';

import { grpcOptions } from '@makido/contracts/grpc';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

import { CommandModule } from './command.module.js';
import { serverCredentials } from './core/mtls/mtls.js';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile('.env');

  const grpcUrl = process.env.GRPC_URL ?? 'localhost:50051';
  const httpPort = Number(process.env.HTTP_PORT ?? 3000);

  const app = await NestFactory.create(CommandModule);

  // GRPC SERVEUR
  const grpcConfig = grpcOptions('command', grpcUrl);
  app.connectMicroservice<MicroserviceOptions>({
    ...grpcConfig,
    options: { ...grpcConfig.options, credentials: serverCredentials() },
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);

  console.log(`✓ Command service ready`);
  console.log(`  - HTTP (webhooks): http://0.0.0.0:${httpPort}`);
  console.log(`  - gRPC (RPCs):     grpc://${grpcUrl}`);
}

await bootstrap();
