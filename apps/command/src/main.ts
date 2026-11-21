import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import {CommandModule} from "./command.module.js";
import { grpcOptions } from '@makido/contracts/grpc';

async function bootstrap() {
  const grpcUrl = process.env.GRPC_URL || 'localhost:50051';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      CommandModule,
      grpcOptions('command', grpcUrl),
  );
  await app.listen();
}
bootstrap();