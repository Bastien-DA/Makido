import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DataSource, In } from 'typeorm';

import { isRecord } from '../../../../core/common/validation.js';
import { priceLine, type RequestedLine } from '../order-pricing.js';
import { DownstreamService } from './downstream.service.js';
import {Order} from "../../entities/order.entity.js";
import {Article} from "../../../articles/entities/article.entity.js";

export interface FinalizeCommandRequest {
  idempotencyKey: string;
  items: RequestedLine[];
  totalCents: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly downstream: DownstreamService,
  ) {}

  async finalize(
    request: FinalizeCommandRequest,
  ): Promise<{ shortReference: string }> {
    if (
      typeof request.idempotencyKey !== 'string' ||
      request.idempotencyKey.trim().length === 0 ||
      request.idempotencyKey.length > 200 ||
      !Array.isArray(request.items) ||
      request.items.length === 0 ||
      typeof request.totalCents !== 'string' ||
      !/^(0|[1-9]\d*)$/.test(request.totalCents)
    ) {
      throw rpcError(status.INVALID_ARGUMENT, 'Commande invalide.');
    }
    for (const item of request.items) {
      if (
        !isRecord(item) ||
        typeof item.articleId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          item.articleId,
        ) ||
        !Array.isArray(item.customizations)
      ) {
        throw rpcError(status.INVALID_ARGUMENT, 'Ligne de commande invalide.');
      }
    }
    const requestHash = createHash('sha256')
      .update(JSON.stringify(request))
      .digest('hex');
    const order = await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [request.idempotencyKey],
      );
      const orders = manager.getRepository(Order);
      const existing = await orders.findOneBy({
        idempotencyKey: request.idempotencyKey,
      });
      if (existing) {
        if (existing.requestHash !== requestHash) {
          throw rpcError(
            status.ALREADY_EXISTS,
            "Clé d'idempotence déjà utilisée pour une autre commande.",
          );
        }

        return existing;
      }

      const articles = await manager.getRepository(Article).find({
        where: { id: In(request.items.map((item) => item.articleId)) },
        lock: { mode: 'pessimistic_read' },
      });
      const byId = new Map(articles.map((article) => [article.id, article]));
      let total = 0;
      const items = request.items.map((item) => {
        const article = byId.get(item.articleId.toLowerCase());
        if (!article) throw rpcError(status.NOT_FOUND, 'Article introuvable.');
        const priced = priceLine(article, item);
        total += priced.totalCents;
        if (!Number.isSafeInteger(total)) {
          throw rpcError(
            status.INVALID_ARGUMENT,
            'Montant de la commande trop élevé.',
          );
        }

        return priced.snapshot;
      });
      if (String(total) !== request.totalCents) {
        throw rpcError(
          status.FAILED_PRECONDITION,
          'Le prix de la commande ne correspond pas au catalogue.',
        );
      }

      const createdAt = new Date();
      const day = createdAt.toISOString().slice(0, 10);
      const counters: { value: number }[] = await manager.query(
        'INSERT INTO order_counters (day, value) VALUES ($1, 1) ON CONFLICT (day) DO UPDATE SET value = CASE WHEN order_counters.value = 999999999 THEN 1 ELSE order_counters.value + 1 END RETURNING value',
        [day],
      );
      const shortReference = String(counters[0].value).padStart(9, '0');

      return orders.save(
        orders.create({
          idempotencyKey: request.idempotencyKey,
          requestHash,
          reference: `${day}-${shortReference}`,
          shortReference,
          createdAt,
          totalCents: String(total),
          items,
        }),
      );
    });

    return { shortReference: order.shortReference };
  }

  async confirmPayment(
    reference: string,
    createdAtUtc: string,
  ): Promise<object> {
    if (
      typeof reference !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}-\d{9}$/.test(reference) ||
      typeof createdAtUtc !== 'string'
    ) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        'Référence de commande invalide.',
      );
    }
    const date = new Date(createdAtUtc);
    if (Number.isNaN(date.getTime()) || date.toISOString() !== createdAtUtc) {
      throw rpcError(status.INVALID_ARGUMENT, 'Horodatage UTC invalide.');
    }
    const orders = this.dataSource.getRepository(Order);
    const order = await orders.findOneBy({ reference, createdAt: date });
    if (!order) throw rpcError(status.NOT_FOUND, 'Commande introuvable.');
    await orders.update(order.id, { paymentConfirmed: true });
    await this.downstream.createTicket(order);
    await orders.update(order.id, { ticketSent: true });

    return {};
  }
}
