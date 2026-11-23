import type { status } from '@grpc/grpc-js';

import {
  type GrpcOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { fileURLToPath } from 'node:url';

export type GrpcPackage = 'command' | 'payment';

const PROTO_DIR = fileURLToPath(new URL('../proto/', import.meta.url));

export function grpcOptions(pkg: GrpcPackage, url: string): GrpcOptions {
  return {
    options: {
      loader: {
        arrays: true,
        defaults: true,
        enums: String,
        keepCase: false,
        longs: String,
      },
      package: pkg,
      protoPath: `${PROTO_DIR}${pkg}.proto`,
      url,
    },
    transport: Transport.GRPC,
  };
}

/** A gRPC error, with its status code, that the gateway turns into an HTTP error */
export function rpcError(code: status, message: string): RpcException {
  return new RpcException({ code, message });
}
