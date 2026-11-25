import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type HydratedDocument, isValidObjectId, type Model } from 'mongoose';

import type { FinalStatus, NewPayment, Payment } from '../payment.js';

import { PaymentRepository } from '../payment.repository.js';
import { MongoPayment } from './payment.schema.js';

type PaymentDocument = HydratedDocument<MongoPayment>;

@Injectable()
export class MongoPaymentRepository extends PaymentRepository {
  constructor(
    @InjectModel(MongoPayment.name)
    private readonly payments: Model<MongoPayment>,
  ) {
    super();
  }

  async create(data: NewPayment): Promise<Payment> {
    return toPayment(await this.payments.create(data));
  }

  async findById(id: string): Promise<Payment | undefined> {
    if (!isValidObjectId(id)) return undefined;

    return toPaymentOrUndefined(await this.payments.findById(id).exec());
  }

  async findPendingByOrderId(orderId: string): Promise<Payment | undefined> {
    return toPaymentOrUndefined(
      await this.payments.findOne({ orderId, status: 'PENDING' }).exec(),
    );
  }

  async finalize(
    id: string,
    status: FinalStatus,
  ): Promise<Payment | undefined> {
    if (!isValidObjectId(id)) return undefined;

    return toPaymentOrUndefined(
      await this.payments
        .findOneAndUpdate(
          { _id: id, status: 'PENDING' },
          { status },
          { returnDocument: 'after' },
        )
        .exec(),
    );
  }

  async setExternalId(
    id: string,
    externalId: string,
  ): Promise<Payment | undefined> {
    if (!isValidObjectId(id)) return undefined;

    return toPaymentOrUndefined(
      await this.payments
        .findByIdAndUpdate(id, { externalId }, { returnDocument: 'after' })
        .exec(),
    );
  }
}

// The only place that knows the Mongo format (_id as ObjectId, etc.)
function toPayment(document: PaymentDocument): Payment {
  return {
    amount: document.amount,
    createdAt: document.createdAt,
    currency: document.currency,
    externalId: document.externalId,
    id: document._id.toString(),
    orderId: document.orderId,
    status: document.status,
    updatedAt: document.updatedAt,
  };
}

function toPaymentOrUndefined(
  document: null | PaymentDocument,
): Payment | undefined {
  return document ? toPayment(document) : undefined;
}
