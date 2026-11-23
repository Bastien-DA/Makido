import type { MicroserviceOptions } from '@nestjs/microservices';

import { grpcOptions } from '@makido/contracts/grpc';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

import { CommandModule } from './command.module.js';
import { serverCredentials } from './mtls.js';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile('.env');
  const grpcUrl = process.env.GRPC_URL ?? 'localhost:50051';

  const options = grpcOptions('command', grpcUrl);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommandModule,
    {
      ...options,
      options: { ...options.options, credentials: serverCredentials() },
    },
  );
  await app.listen();
}

await bootstrap();
