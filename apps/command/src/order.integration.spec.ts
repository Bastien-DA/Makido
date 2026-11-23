import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { DownstreamService } from './downstream.service.js';
import { Article } from './entities/article.entity.js';
import { OrderCounter } from './entities/order-counter.entity.js';
import { Order } from './entities/order.entity.js';
import { seedArticles } from './fixtures/articles.js';
import { InitialOrders1760000000000 } from './migrations/initial-orders.js';
import { OrderService } from './order.service.js';

const port = process.env.COMMAND_TEST_DB_PORT;
const request = () => ({
  idempotencyKey: randomUUID(),
  items: [
    {
      articleId: '11111111-1111-4111-8111-111111111101',
      quantity: 1,
      customizations: [],
    },
  ],
  totalCents: '750',
});

describe.skipIf(!port)('order persistence against isolated PostgreSQL', () => {
  const downstream = {
    initiatePayment: vi.fn().mockImplementation(() => Promise.resolve()),
    createTicket: vi.fn().mockImplementation(() => Promise.resolve()),
  };
  const database = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: Number(port),
    username: 'isolated_test',
    password: 'isolated_test',
    database: 'isolated_test',
    entities: [Article, Order, OrderCounter],
    migrations: [InitialOrders1760000000000],
  });
  let service: OrderService;

  beforeAll(async () => {
    await database.initialize();
    await database.runMigrations();
    await database.getRepository(Article).save(seedArticles);
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: DataSource, useValue: database },
        { provide: DownstreamService, useValue: downstream },
      ],
    }).compile();
    service = module.get(OrderService);
  });

  afterAll(async () => {
    if (database.isInitialized) await database.destroy();
  });

  it('validates prices and deduplicates concurrent retries without reusing the key for another order', async () => {
    await expect(
      service.finalize({ ...request(), totalCents: '1' }),
    ).rejects.toThrow();
    const input = request();
    const results = await Promise.all(
      Array.from({ length: 5 }, () => service.finalize(input)),
    );
    expect(new Set(results.map((result) => result.shortReference)).size).toBe(
      1,
    );
    expect(
      await database
        .getRepository(Order)
        .countBy({ idempotencyKey: input.idempotencyKey }),
    ).toBe(1);
    await expect(
      service.finalize({ ...input, totalCents: '751' }),
    ).rejects.toThrow();
  });

  it('retains the order after downstream failures and retries confirmation idempotently', async () => {
    const input = request();
    downstream.initiatePayment.mockRejectedValueOnce(
      new Error('payment unavailable'),
    );
    await expect(service.finalize(input)).rejects.toThrow(
      'payment unavailable',
    );
    const stored = await database
      .getRepository(Order)
      .findOneByOrFail({ idempotencyKey: input.idempotencyKey });
    expect(await service.finalize(input)).toEqual({
      shortReference: stored.shortReference,
    });

    downstream.createTicket.mockRejectedValueOnce(
      new Error('ticket unavailable'),
    );
    await expect(
      service.confirmPayment(stored.reference, stored.createdAt.toISOString()),
    ).rejects.toThrow('ticket unavailable');
    const updated = await database
      .getRepository(Order)
      .findOneByOrFail({ id: stored.id });
    expect(updated.paymentConfirmed).toBe(true);
    await expect(
      service.confirmPayment(
        stored.reference,
        new Date(stored.createdAt.getTime() + 1).toISOString(),
      ),
    ).rejects.toThrow();
    await service.confirmPayment(
      stored.reference,
      stored.createdAt.toISOString(),
    );
    const count = downstream.createTicket.mock.calls.length;
    await service.confirmPayment(
      stored.reference,
      stored.createdAt.toISOString(),
    );
    expect(downstream.createTicket).toHaveBeenCalledTimes(count);
  });

  it('allocates distinct references concurrently and wraps the daily counter', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => service.finalize(request())),
    );
    expect(new Set(results.map((result) => result.shortReference)).size).toBe(
      10,
    );
    const day = new Date().toISOString().slice(0, 10);
    await database
      .getRepository(OrderCounter)
      .update({ day }, { value: 999_999_999 });
    const wrapped = await service.finalize(request());
    expect(wrapped.shortReference).toBe('000000001');
  });
});
