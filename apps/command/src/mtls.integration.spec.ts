import { credentials, ServerCredentials, status } from '@grpc/grpc-js';
import { grpcOptions } from '@makido/contracts/grpc';
import { Controller } from '@nestjs/common';
import {
  ClientProxyFactory,
  GrpcMethod,
  Transport,
} from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { firstValueFrom, type Observable, timeout } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ArticlesController } from './features/articles/presentation/articles.controller.js';
import { ArticlesService } from './features/articles/domain/services/articles.service.js';
import { serverCredentials } from './core/mtls/mtls.js';
import { OrdersService } from './features/orders/domain/services/orders.service.js';
import { OrdersController } from './features/orders/presentation/orders.controller.js';

interface CommandClient {
  getArticles(request: object): Observable<object>;
  finalizeCommand(request: {
    idempotencyKey: string;
    totalCents: string;
    items: object[];
  }): Observable<object>;
  paymentConfirmed(request: {
    reference: string;
    createdAtUtc: string;
  }): Observable<object>;
}

const certDir = process.env.COMMAND_TEST_CERT_DIR;

async function unusedPort(): Promise<number> {
  const socket = createServer();
  const port = await new Promise<number>((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Cannot allocate a test port.'));

        return;
      }
      resolve(address.port);
    });
  });
  await new Promise<void>((resolve, reject) =>
    socket.close((error) => {
      if (error) reject(error);
      else resolve();
    }),
  );

  return port;
}

describe.skipIf(!certDir)('gRPC mTLS', () => {
  it('accepts trusted clients for article operations', async () => {
    if (!certDir) throw new Error('Test certificates are required.');
    const file = (name: string) => path.join(certDir, name);
    process.env.GRPC_CLIENT_CA_PATH = file('client-ca.crt');
    process.env.PAYMENT_CLIENT_CA_PATH = file('payment-ca.crt');
    process.env.GRPC_CERT_PATH = file('command.crt');
    process.env.GRPC_PRIVATE_KEY_PATH = file('command.key');

    const port = await unusedPort();

    const finalize = vi.fn().mockResolvedValue({ shortReference: '000000001' });
    const module = await Test.createTestingModule({
      controllers: [ArticlesController, OrdersController],
      providers: [
        {
          provide: ArticlesService,
          useValue: { findArticles: vi.fn().mockResolvedValue([]) },
        },
        { provide: OrdersService, useValue: { finalize } },
      ],
    }).compile();
    const options = grpcOptions('command', `localhost:${port}`);
    const server = module.createNestMicroservice({
      ...options,
      options: { ...options.options, credentials: serverCredentials() },
    });
    await server.listen();
    const client = (name: string) =>
      ClientProxyFactory.create({
        transport: Transport.GRPC,
        options: {
          ...options.options,
          credentials: credentials.createSsl(
            readFileSync(file('server-ca.crt')),
            readFileSync(file(`${name}.key`)),
            readFileSync(file(`${name}.crt`)),
          ),
        },
      });
    const gateway = client('gateway');
    const untrusted = client('command');
    const insecure = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        ...options.options,
        credentials: credentials.createInsecure(),
      },
    });
    try {
      const gatewayService =
        gateway.getService<CommandClient>('CommandService');
      const insecureService =
        insecure.getService<CommandClient>('CommandService');
      const untrustedService =
        untrusted.getService<CommandClient>('CommandService');
      await expect(
        firstValueFrom(gatewayService.getArticles({}).pipe(timeout(3000))),
      ).resolves.toMatchObject({ articles: [] });
      await expect(
        firstValueFrom(
          gatewayService
            .finalizeCommand({
              idempotencyKey: 'key',
              totalCents: '750',
              items: [{ articleId: 'item', quantity: 1, customizations: [] }],
            })
            .pipe(timeout(3000)),
        ),
      ).resolves.toEqual({ shortReference: '000000001' });
      expect(finalize).toHaveBeenCalledWith({
        idempotencyKey: 'key',
        totalCents: '750',
        items: [{ articleId: 'item', quantity: 1, customizations: [] }],
      });
      await expect(
        firstValueFrom(insecureService.getArticles({}).pipe(timeout(1000))),
      ).rejects.toThrow();
      await expect(
        firstValueFrom(untrustedService.getArticles({}).pipe(timeout(1000))),
      ).rejects.toThrow();
    } finally {
      gateway.close();
      untrusted.close();
      insecure.close();
      await server.close();
    }
  });
});
