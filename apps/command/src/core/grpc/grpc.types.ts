import type { Observable } from 'rxjs';

/** Commande service gRPC interface */
export interface ICommandeGrpcService {
  // Add your Commande service methods here
  // Example:
  // createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse>;
}

/** Ticket service gRPC interface */
export interface ITicketGrpcService {
  createTicket(request: {
    reference: string;
    createdAtUtc: string;
    shortReference: string;
    items: unknown;
    idempotencyKey: string;
  }): Observable<object>;
}
