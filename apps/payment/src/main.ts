import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

// Placeholder: no server yet. The gRPC server comes with CreateTransaction,
// the HTTP server with the Stripe callback
const app = await NestFactory.createApplicationContext(AppModule);
app.enableShutdownHooks();
