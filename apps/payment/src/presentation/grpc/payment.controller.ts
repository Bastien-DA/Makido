import { status } from '@grpc/grpc-js';
import {
  type CreatePaymentRequest,
  type CreatePaymentResponse,
  PAYMENT_SERVICE,
  type Payment as PaymentDto,
} from '@makido/contracts';
import { rpcError } from '@makido/contracts/grpc';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { Payment } from '../../domain/payment.js';

import {
  InvalidPaymentError,
  PaymentConflictError,
  ProviderUnavailableError,
} from '../../domain/payment.errors.js';
import { PaymentService } from '../../domain/payment.service.js';

@Controller()
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @GrpcMethod(PAYMENT_SERVICE, 'CreatePayment')
  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    try {
      const { payment, redirectUrl } =
        await this.service.createPayment(request);

      return { payment: toDto(payment), redirectUrl };
    } catch (error) {
      throw toRpcError(error);
    }
  }
}

function toDto(payment: Payment): PaymentDto {
  return {
    ...payment,
    createdAt: payment.createdAt.toISOString(),
    externalId: payment.externalId ?? '',
    updatedAt: payment.updatedAt.toISOString(),
  };
}

function toRpcError(error: unknown): unknown {
  if (error instanceof InvalidPaymentError) {
    return rpcError(status.INVALID_ARGUMENT, error.message);
  }
  if (error instanceof PaymentConflictError) {
    return rpcError(status.FAILED_PRECONDITION, error.message);
  }
  if (error instanceof ProviderUnavailableError) {
    return rpcError(status.UNAVAILABLE, error.message);
  }

  return error;
}
