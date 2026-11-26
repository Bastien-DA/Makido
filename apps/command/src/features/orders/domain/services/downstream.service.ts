import { Injectable, Logger } from '@nestjs/common';

import { TicketGrpcClient } from '../../../../core/grpc/index.js';
import type { Order } from '../../entities/order.entity.js';

/**
 * Service orchestrant les appels aux services externes (Ticket, etc.)
 * Utilise des wrappers typés pour encapsuler la complexité gRPC
 */
@Injectable()
export class DownstreamService {
  private readonly logger = new Logger(DownstreamService.name);

  constructor(private readonly ticketClient: TicketGrpcClient) {}

  /**
   * Crée un ticket pour une commande via gRPC
   * @param order La commande pour laquelle créer un ticket
   */
  async createTicket(order: Order): Promise<void> {
    try {
      await this.ticketClient.createTicket({
        reference: order.reference,
        createdAtUtc: order.createdAt.toISOString(),
        shortReference: order.shortReference,
        items: order.items,
        idempotencyKey: order.id,
      });
    } catch (error) {
      this.logger.error('Failed to create ticket for order', {
        orderId: order.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
