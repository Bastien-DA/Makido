import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class GrpcError extends Error {
  constructor(
    public readonly code: status,
    message: string,
  ) {
    super(message);
    this.name = 'GrpcError';
  }
}

export function handleGrpcError(error: unknown): never {
  if (error instanceof RpcException) {
    throw error;
  }

  if (error instanceof Error) {
    const message = error.message || 'Unknown gRPC error';

    // Check if it's a gRPC timeout
    if (message.includes('timeout') || message.includes('deadline')) {
      throw new GrpcError(status.DEADLINE_EXCEEDED, message);
    }

    // Check if it's a connection error
    if (message.includes('UNAVAILABLE') || message.includes('connect')) {
      throw new GrpcError(status.UNAVAILABLE, message);
    }

    throw new GrpcError(status.UNKNOWN, message);
  }

  throw new GrpcError(status.UNKNOWN, 'Unknown gRPC error');
}
