import { grpcOptions } from '@makido/contracts/grpc';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { config } from './config.js';

const app = await NestFactory.create(AppModule, { rawBody: true });
app.connectMicroservice(grpcOptions('payment', config.grpcUrl));
app.enableShutdownHooks();

await app.startAllMicroservices();
await app.listen(config.httpPort);
