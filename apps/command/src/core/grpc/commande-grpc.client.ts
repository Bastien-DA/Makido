import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

import { COMMANDE_GRPC_CLIENT } from './grpc-clients.module.js';
import { ICommandeGrpcService } from './grpc.types.js';

/**
 * Wrapper typé pour le service gRPC Commande
 * À compléter selon les méthodes du service Commande
 */
@Injectable()
export class CommandeGrpcClient implements OnModuleInit {
  private commandeService: ICommandeGrpcService;
  private readonly DEFAULT_TIMEOUT_MS = 5000;

  constructor(@Inject(COMMANDE_GRPC_CLIENT) private grpcClient: ClientGrpc) {}

  onModuleInit(): void {
    this.commandeService = this.grpcClient.getService<ICommandeGrpcService>(
      'CommandeService',
    );
  }

  // Add your methods here
  // Example:
  // async createOrder(request: CreateOrderRequest, metadata?: Metadata): Promise<CreateOrderResponse> {
  //   ...
  // }
}
