import type { ServerUnaryCall } from '@grpc/grpc-js';

import { credentials, ServerCredentials, status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';
import { X509Certificate } from 'node:crypto';
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
  const paymentCa = requiredFile('PAYMENT_CLIENT_CA_PATH');
  if (!new X509Certificate(paymentCa).ca) {
    throw new Error(
      'PAYMENT_CLIENT_CA_PATH doit désigner une autorité de certification.',
    );
  }

  return ServerCredentials.createSsl(
    Buffer.concat([trustedClients, Buffer.from('\n'), paymentCa]),
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

export function assertPaymentIdentity(
  call: ServerUnaryCall<unknown, unknown>,
): void {
  const context = call.getAuthContext();
  const raw = context.sslPeerCertificate?.raw;
  if (context.transportSecurityType !== 'ssl' || !raw) {
    throw rpcError(status.UNAUTHENTICATED, 'Certificat client requis.');
  }
  const client = new X509Certificate(raw);
  const authority = new X509Certificate(requiredFile('PAYMENT_CLIENT_CA_PATH'));
  if (
    !authority.ca ||
    !client.checkIssued(authority) ||
    !client.verify(authority.publicKey)
  ) {
    throw rpcError(
      status.PERMISSION_DENIED,
      'Certificat de paiement non autorisé.',
    );
  }
}
