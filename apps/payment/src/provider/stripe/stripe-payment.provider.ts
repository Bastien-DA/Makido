import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { config } from '../../config.js';
import {
  type InitiatedPayment,
  InvalidCallbackError,
  type PaymentOutcome,
  PaymentProvider,
  type PaymentRequest,
} from '../payment-provider.js';

/**
 * Stripe Checkout: Stripe hosts the payment page, we only redirect to it.
 * The callback (webhook signed by Stripe) is the only source of truth
 */
@Injectable()
export class StripePaymentProvider extends PaymentProvider {
  private readonly stripe = new Stripe(config.stripe.secretKey, {
    maxNetworkRetries: 2,
  });

  async findRedirectUrl(externalId: string): Promise<string | undefined> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(externalId);

      return session.status === 'open' && session.url ? session.url : undefined;
    } catch (error) {
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === 'resource_missing'
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async initiatePayment({
    amount,
    currency,
    orderId,
    paymentId,
  }: PaymentRequest): Promise<InitiatedPayment> {
    const expiresAt =
      Math.floor(Date.now() / 1000) + config.checkout.ttlMinutes * 60;

    const session = await this.stripe.checkout.sessions.create(
      {
        cancel_url: config.checkout.cancelUrl,
        client_reference_id: paymentId,
        expires_at: expiresAt,
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: `Commande ${orderId}` },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        metadata: { orderId, paymentId },
        mode: 'payment',
        success_url: config.checkout.successUrl,
      },
      { idempotencyKey: `checkout-${paymentId}` },
    );

    if (!session.url) {
      throw new Error(`Stripe returned no URL for session ${session.id}`);
    }

    return { externalId: session.id, redirectUrl: session.url };
  }

  parseCallback(
    payload: Buffer,
    signature: string,
  ): PaymentOutcome | undefined {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret,
      );
    } catch {
      throw new InvalidCallbackError('Invalid Stripe signature');
    }

    switch (event.type) {
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        return toOutcome(event.data.object, 'FAILED');
      }
      case 'checkout.session.async_payment_succeeded': {
        return toOutcome(event.data.object, 'SUCCEEDED');
      }
      case 'checkout.session.completed': {
        // Completed but not paid yet (bank transfer…): async_payment_* follows
        return event.data.object.payment_status === 'paid'
          ? toOutcome(event.data.object, 'SUCCEEDED')
          : undefined;
      }
      default: {
        return undefined;
      }
    }
  }
}

function toOutcome(
  session: Stripe.Checkout.Session,
  status: PaymentOutcome['status'],
): PaymentOutcome | undefined {
  if (!session.client_reference_id) return undefined;

  return {
    externalId: session.id,
    paymentId: session.client_reference_id,
    status,
  };
}
