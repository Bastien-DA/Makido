import { status } from '@grpc/grpc-js';
import { grpcOptions, rpcError } from '@makido/contracts/grpc';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, type Observable, timeout } from 'rxjs';

import type { Order } from './entities/order.entity.js';

import { clientCredentials } from './mtls.js';

interface PaymentClient {
  initiatePayment(request: {
    reference: string;
    createdAtUtc: string;
    amountCents: string;
    idempotencyKey: string;
  }): Observable<object>;
}

interface TicketClient {
  createTicket(request: {
    reference: string;
    createdAtUtc: string;
    shortReference: string;
    items: Order['items'];
    idempotencyKey: string;
  }): Observable<object>;
}

function endpoint(name: string): string {
  const url = process.env[name];
  if (!url) throw new Error(`La variable ${name} est obligatoire.`);

  return url;
}

@Injectable()
export class DownstreamService implements OnModuleDestroy {
  private readonly logger = new Logger(DownstreamService.name);
  private readonly payment = ClientProxyFactory.create({
    transport: Transport.GRPC,
    options: {
      ...grpcOptions('payment', endpoint('PAYMENT_GRPC_URL')).options,
      credentials: clientCredentials(),
    },
  });

  private readonly ticket = ClientProxyFactory.create({
    transport: Transport.GRPC,
    options: {
      ...grpcOptions('ticket', endpoint('TICKET_GRPC_URL')).options,
      credentials: clientCredentials(),
    },
  });

  initiatePayment(order: Order): Promise<void> {
    return this.call('Paiement', () =>
      this.payment.getService<PaymentClient>('PaymentService').initiatePayment({
        reference: order.reference,
        createdAtUtc: order.createdAt.toISOString(),
        amountCents: order.totalCents,
        idempotencyKey: order.id,
      }),
    );
  }

  createTicket(order: Order): Promise<void> {
    return this.call('Ticket', () =>
      this.ticket.getService<TicketClient>('TicketService').createTicket({
        reference: order.reference,
        createdAtUtc: order.createdAt.toISOString(),
        shortReference: order.shortReference,
        items: order.items,
        idempotencyKey: order.id,
      }),
    );
  }

  private async call(
    service: 'Paiement' | 'Ticket',
    request: () => Observable<object>,
  ): Promise<void> {
    try {
      await firstValueFrom(request().pipe(timeout(10_000)));
    } catch (error) {
      this.logger.error(`Échec de l’appel au service ${service}`, error);
      throw rpcError(status.UNAVAILABLE, `Service ${service} indisponible.`);
    }
  }

  onModuleDestroy(): void {
    this.payment.close();
    this.ticket.close();
  }
}
