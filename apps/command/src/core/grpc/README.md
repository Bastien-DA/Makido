# Architecture Client gRPC Modulaire

## Vue d'ensemble

Cette architecture encapsule les clients gRPC de manière propre et typée, en suivant les principes SOLID :

- **Single Responsibility** : Chaque wrapper gère un seul service gRPC
- **Dependency Inversion** : Les services métier dépendent d'abstractions, pas d'implémentations
- **Type Safety** : Interfaces TypeScript strictes pour chaque service gRPC
- **Error Handling** : Gestion centralisée des erreurs gRPC

## Structure

```
core/grpc/
├── grpc-clients.module.ts       # Module NestJS enregistrant les clients gRPC
├── grpc.types.ts                # Interfaces TypeScript des services gRPC
├── grpc-errors.ts               # Utilitaires de gestion d'erreurs
├── ticket-grpc.client.ts        # Wrapper typé pour le service Ticket
├── commande-grpc.client.ts      # Wrapper typé pour le service Commande
├── index.ts                      # Barrel export
└── README.md                     # Cette documentation
```

## Configuration requise

### Variables d'environnement

```bash
# URLs des services gRPC externes
COMMANDE_GRPC_URL=localhost:50052
TICKET_GRPC_URL=localhost:50053

# Certificats mTLS
GRPC_CERT_PATH=/path/to/command.crt
GRPC_PRIVATE_KEY_PATH=/path/to/command.key
GRPC_SERVER_CA_PATH=/path/to/server-ca.crt
GRPC_CLIENT_CA_PATH=/path/to/client-ca.crt
PAYMENT_CLIENT_CA_PATH=/path/to/payment-ca.crt
```

## Utilisation

### 1. Importer le module

```typescript
import { GrpcClientsModule } from './core/grpc/index.js';

@Module({
  imports: [GrpcClientsModule, ...],
})
export class MyModule {}
```

### 2. Injecter un client wrapper

```typescript
import { TicketGrpcClient } from './core/grpc/ticket-grpc.client.js';

@Injectable()
export class MyService {
  constructor(private ticketClient: TicketGrpcClient) {}

  async handleOrder(order: Order) {
    try {
      await this.ticketClient.createTicket({
        reference: order.reference,
        createdAtUtc: order.createdAt.toISOString(),
        shortReference: order.shortReference,
        items: order.items,
        idempotencyKey: order.id,
      });
    } catch (error) {
      // Les erreurs gRPC sont converties en exceptions NestJS
      this.logger.error('Failed to create ticket', error);
      throw error;
    }
  }
}
```

### 3. Ajouter une nouvelle méthode à un client existant

```typescript
// ticket-grpc.client.ts
async getTicket(ticketId: string): Promise<GetTicketResponse> {
  try {
    const response = await firstValueFrom(
      this.ticketService
        .getTicket({ ticketId })
        .pipe(timeout(this.DEFAULT_TIMEOUT_MS)),
      { defaultValue: null },
    );
    return response as GetTicketResponse;
  } catch (error) {
    handleGrpcError(error);
  }
}
```

### 4. Ajouter un nouveau service gRPC

#### Étape 1 : Définir l'interface

```typescript
// grpc.types.ts
export interface IMyGrpcService {
  myMethod(request: MyRequest): Observable<MyResponse>;
}
```

#### Étape 2 : Enregistrer le client

```typescript
// grpc-clients.module.ts
{
  name: MY_GRPC_CLIENT,
  useFactory: () => {
    const url = process.env.MY_GRPC_URL;
    if (!url) {
      throw new Error('MY_GRPC_URL environment variable is required');
    }
    const options = grpcOptions('my-service', url);
    return {
      transport: Transport.GRPC,
      options: {
        ...options.options,
        credentials: clientCredentials(),
      },
    };
  },
}
```

#### Étape 3 : Créer le wrapper

```typescript
// my-service-grpc.client.ts
@Injectable()
export class MyServiceGrpcClient implements OnModuleInit {
  private myService: IMyGrpcService;

  constructor(@Inject(MY_GRPC_CLIENT) private grpcClient: ClientGrpc) {}

  onModuleInit(): void {
    this.myService = this.grpcClient.getService<IMyGrpcService>(
      'MyService',
    );
  }

  async myMethod(request: MyRequest): Promise<MyResponse> {
    try {
      return await firstValueFrom(
        this.myService.myMethod(request).pipe(timeout(5000)),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
```

#### Étape 4 : Exporter depuis index.ts

```typescript
export * from './my-service-grpc.client.js';
```

## Gestion des erreurs

Les erreurs gRPC sont automatiquement converties en exceptions NestJS :

```typescript
try {
  await this.ticketClient.createTicket(request);
} catch (error) {
  // error est une GrpcError avec code de statut et message
  if (error instanceof GrpcError) {
    if (error.code === status.DEADLINE_EXCEEDED) {
      // Timeout
    } else if (error.code === status.UNAVAILABLE) {
      // Service indisponible
    }
  }
  throw error;
}
```

## Bonnes pratiques

1. **Toujours utiliser les wrappers** : Ne jamais injecter `ClientGrpc` directement
2. **Timeout systématique** : Chaque appel a un timeout de 5s par défaut
3. **Logging structuré** : Utilisez le Logger NestJS pour toutes les erreurs
4. **Types stricts** : Définissez toujours les interfaces pour chaque service
5. **Métadonnées optionnelles** : Passez des métadonnées gRPC si nécessaire

```typescript
// Exemple avec métadonnées
const metadata = new Metadata();
metadata.add('x-request-id', generateId());
await this.ticketClient.createTicket(request, metadata);
```

## Troubleshooting

### "TICKET_GRPC_URL environment variable is required"

Assurez-vous que la variable d'environnement est définie dans `.env` :
```bash
TICKET_GRPC_URL=localhost:50053
```

### "Service unavailable"

Vérifiez que le service gRPC cible est en écoute sur l'URL configurée :
```bash
# Testez la connexion
grpcurl -plaintext localhost:50053 list
```

### "Deadline exceeded"

L'appel gRPC a dépassé le timeout de 5s. Augmentez le timeout dans le wrapper si nécessaire, ou optimisez le service gRPC cible.
