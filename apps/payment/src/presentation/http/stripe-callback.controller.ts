import type { IncomingMessage } from 'node:http';

import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';

import { PaymentService } from '../../domain/payment.service.js';
import { InvalidCallbackError } from '../../domain/ports/payment-provider.js';

/**
 * Called by Stripe (webhook), not by our services: the only HTTP route of the
 * microservice, an exception to "the gateway is the only HTTP entry point".
 * Answer codes matter: Stripe retries anything that is not 2xx
 */
@Controller('callbacks')
export class StripeCallbackController {
  constructor(private readonly service: PaymentService) {}

  @HttpCode(200)
  @Post('stripe')
  async handle(
    @Req() request: RawBodyRequest<IncomingMessage>,
    @Headers('stripe-signature') signature?: string,
  ): Promise<{ received: true }> {
    if (!request.rawBody || !signature) {
      throw new BadRequestException('Missing body or Stripe signature');
    }

    try {
      await this.service.handleCallback(request.rawBody, signature);
    } catch (error) {
      if (error instanceof InvalidCallbackError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    return { received: true };
  }
}
