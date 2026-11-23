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

import { CommandController } from './command.controller.js';
import { CommandService } from './command.service.js';
import { DownstreamService } from './downstream.service.js';
import { Order } from './entities/order.entity.js';
import { serverCredentials } from './mtls.js';
import { OrderService } from './order.service.js';

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
const paymentCall = vi.fn();
const ticketCall = vi.fn();

@Controller()
class PaymentStub {
  @GrpcMethod('PaymentService', 'InitiatePayment')
  initiatePayment(data: object) {
    paymentCall(data);

    return {};
  }
}

@Controller()
class TicketStub {
  @GrpcMethod('TicketService', 'CreateTicket')
  createTicket(data: object) {
    ticketCall(data);

    return {};
  }
}

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

async function testDownstream() {
  if (!certDir) throw new Error('Test certificates are required.');
  const file = (name: string) => path.join(certDir, name);
  const paymentPort = await unusedPort();
  const ticketPort = await unusedPort();
  const tls = ServerCredentials.createSsl(
    readFileSync(file('server-ca.crt')),
    [
      {
        private_key: readFileSync(file('command.key')),
        cert_chain: readFileSync(file('command.crt')),
      },
    ],
    true,
  );
  const paymentOptions = grpcOptions('payment', `localhost:${paymentPort}`);
  const ticketOptions = grpcOptions('ticket', `localhost:${ticketPort}`);
  const paymentModule = await Test.createTestingModule({
    controllers: [PaymentStub],
  }).compile();
  const ticketModule = await Test.createTestingModule({
    controllers: [TicketStub],
  }).compile();
  const paymentServer = paymentModule.createNestMicroservice({
    ...paymentOptions,
    options: { ...paymentOptions.options, credentials: tls },
  });
  const ticketServer = ticketModule.createNestMicroservice({
    ...ticketOptions,
    options: { ...ticketOptions.options, credentials: tls },
  });
  process.env.PAYMENT_GRPC_URL = `localhost:${paymentPort}`;
  process.env.TICKET_GRPC_URL = `localhost:${ticketPort}`;
  process.env.GRPC_SERVER_CA_PATH = file('server-ca.crt');
  process.env.GRPC_CERT_PATH = file('command.crt');
  process.env.GRPC_PRIVATE_KEY_PATH = file('command.key');
  const downstream = new DownstreamService();
  const order = Object.assign(new Order(), {
    id: 'order-id',
    reference: '2026-01-01-000000001',
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    shortReference: '000000001',
    totalCents: '1250',
    items: [
      {
        articleId: 'article-id',
        name: 'Sushi',
        quantity: 1,
        ingredients: ['riz'],
        customizations: [],
      },
    ],
  });
  try {
    await paymentServer.listen();
    await ticketServer.listen();
    await downstream.initiatePayment(order);
    await downstream.createTicket(order);
    expect(paymentCall).toHaveBeenCalledWith({
      reference: order.reference,
      createdAtUtc: order.createdAt.toISOString(),
      amountCents: '1250',
      idempotencyKey: order.id,
    });
    expect(ticketCall).toHaveBeenCalledWith({
      reference: order.reference,
      createdAtUtc: order.createdAt.toISOString(),
      shortReference: order.shortReference,
      items: order.items,
      idempotencyKey: order.id,
    });
  } finally {
    downstream.onModuleDestroy();
    await paymentServer.close();
    await ticketServer.close();
  }
}

describe.skipIf(!certDir)('gRPC mTLS', () => {
  it(
    'sends payment and ticket snapshots over authenticated gRPC',
    testDownstream,
  );
  it('accepts trusted clients but restricts payment confirmation to the payment CA', async () => {
    if (!certDir) throw new Error('Test certificates are required.');
    const file = (name: string) => path.join(certDir, name);
    process.env.GRPC_CLIENT_CA_PATH = file('client-ca.crt');
    process.env.PAYMENT_CLIENT_CA_PATH = file('payment-ca.crt');
    process.env.GRPC_CERT_PATH = file('command.crt');
    process.env.GRPC_PRIVATE_KEY_PATH = file('command.key');

    const port = await unusedPort();

    const confirmPayment = vi.fn().mockResolvedValue({});
    const finalize = vi.fn().mockResolvedValue({ shortReference: '000000001' });
    const module = await Test.createTestingModule({
      controllers: [CommandController],
      providers: [
        {
          provide: CommandService,
          useValue: { findArticles: vi.fn().mockResolvedValue([]) },
        },
        { provide: OrderService, useValue: { confirmPayment, finalize } },
      ],
    }).compile();
    const options = grpcOptions('command', `localhost:${port}`);
    const server = module.createNestMicroservice({
      ...options,
      options: { ...options.options, credentials: serverCredentials() },
    });
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
    const payer = client('payer');
    const untrusted = client('command');
    const insecure = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        ...options.options,
        credentials: credentials.createInsecure(),
      },
    });
    const confirmation = {
      reference: '2026-01-01-000000001',
      createdAtUtc: '2026-01-01T00:00:00.000Z',
    };
    try {
      await server.listen();
      const gatewayService =
        gateway.getService<CommandClient>('CommandService');
      const paymentService = payer.getService<CommandClient>('CommandService');
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
        firstValueFrom(
          gatewayService.paymentConfirmed(confirmation).pipe(timeout(3000)),
        ),
      ).rejects.toMatchObject({ code: status.PERMISSION_DENIED });
      await expect(
        firstValueFrom(
          paymentService.paymentConfirmed(confirmation).pipe(timeout(3000)),
        ),
      ).resolves.toBeDefined();
      expect(confirmPayment).toHaveBeenCalledOnce();
      await expect(
        firstValueFrom(insecureService.getArticles({}).pipe(timeout(1000))),
      ).rejects.toThrow();
      await expect(
        firstValueFrom(untrustedService.getArticles({}).pipe(timeout(1000))),
      ).rejects.toThrow();
    } finally {
      gateway.close();
      payer.close();
      untrusted.close();
      insecure.close();
      await server.close();
    }
  });
});
