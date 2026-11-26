import type { GrpcOptions } from '@nestjs/microservices';

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {grpcOptions, GrpcPackage} from '@makido/contracts/grpc';

import { clientCredentials } from '../mtls/mtls.js';

export const COMMANDE_GRPC_CLIENT = 'COMMANDE_GRPC_CLIENT';
export const TICKET_GRPC_CLIENT = 'TICKET_GRPC_CLIENT';

function createGrpcClientProvider(name: string, contractName: GrpcPackage, envVar: string) {
  return {
    name,
    useFactory: (): GrpcOptions => {
      const url = process.env[envVar];
      if (!url) {
        throw new Error(`${envVar} environment variable is required`);
      }

      const baseConfig = grpcOptions(contractName, url);

      return {
        transport: Transport.GRPC,
        options: {
          ...baseConfig.options,
          url, // garantit que l'URL cible écrase celle par défaut si besoin
          credentials: clientCredentials(),
        },
      };
    },
  };
}

// GRPC CLIENT
@Module({
  imports: [
    ClientsModule.registerAsync([
      createGrpcClientProvider(COMMANDE_GRPC_CLIENT, 'command', 'COMMANDE_GRPC_URL'),
      createGrpcClientProvider(TICKET_GRPC_CLIENT, 'ticket', 'TICKET_GRPC_URL'),
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientsModule {}