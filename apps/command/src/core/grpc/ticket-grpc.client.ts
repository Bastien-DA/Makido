import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom, timeout } from 'rxjs';

import { TICKET_GRPC_CLIENT } from './grpc-clients.module.js';
import { ITicketGrpcService } from './grpc.types.js';
import { handleGrpcError } from './grpc-errors.js';

export interface CreateTicketRequest {
  reference: string;
  createdAtUtc: string;
  shortReference: string;
  items: unknown;
  idempotencyKey: string;
}

export interface CreateTicketResponse {
  success?: boolean;
  ticketId?: string;
  message?: string;
}

/**
 * Wrapper typé pour le service gRPC Ticket
 * Encapsule ClientGrpc et expose des méthodes async propres
 */
@Injectable()
export class TicketGrpcClient implements OnModuleInit {
  private ticketService: ITicketGrpcService;
  private readonly DEFAULT_TIMEOUT_MS = 5000;

  constructor(@Inject(TICKET_GRPC_CLIENT) private grpcClient: ClientGrpc) {}

  onModuleInit(): void {
    this.ticketService = this.grpcClient.getService<ITicketGrpcService>(
      'TicketService',
    );
  }

  /**
   * Crée un ticket via gRPC
   * @param request Les données du ticket
   * @param metadata Métadonnées optionnelles (ex: x-request-id)
   */
  async createTicket(
    request: CreateTicketRequest,
    metadata?: Metadata,
  ): Promise<CreateTicketResponse> {
    try {
      const response = await firstValueFrom(
        this.ticketService
          .createTicket(request)
          .pipe(timeout(this.DEFAULT_TIMEOUT_MS)),
        {
          defaultValue: { success: true },
        },
      );

      return response as CreateTicketResponse;
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
