import { grpcOptions } from '@makido/contracts/grpc';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { config } from './config.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcOptions('payment', config.grpcUrl),
  );
  app.enableShutdownHooks();
  await app.listen();
}
await bootstrap();