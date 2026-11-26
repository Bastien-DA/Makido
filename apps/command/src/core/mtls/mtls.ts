import { credentials, ServerCredentials, status } from '@grpc/grpc-js';
import { readFileSync } from 'node:fs';

function requiredFile(name: string): Buffer {
  const path = process.env[name];
  if (!path) {
    throw new Error(`La variable ${name} est obligatoire pour le mTLS.`);
  }

  return readFileSync(path);
}

export function serverCredentials(): ServerCredentials {
  const trustedClients = requiredFile('GRPC_CLIENT_CA_PATH');

  return ServerCredentials.createSsl(
    trustedClients,
    [
      {
        private_key: requiredFile('GRPC_PRIVATE_KEY_PATH'),
        cert_chain: requiredFile('GRPC_CERT_PATH'),
      },
    ],
    true,
  );
}

export function clientCredentials() {
  return credentials.createSsl(
    requiredFile('GRPC_SERVER_CA_PATH'),
    requiredFile('GRPC_PRIVATE_KEY_PATH'),
    requiredFile('GRPC_CERT_PATH'),
  );
}

