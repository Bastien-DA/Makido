import type { MicroserviceOptions } from '@nestjs/microservices';

import { grpcOptions } from '@makido/contracts/grpc';
import { NestFactory } from '@nestjs/core';

import { CommandModule } from './command.module.js';

async function bootstrap() {
  const grpcUrl = process.env.GRPC_URL ?? 'localhost:50051';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommandModule,
    grpcOptions('command', grpcUrl),
  );
  await app.listen();
}

await bootstrap();
