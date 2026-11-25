import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { PaymentStatus } from '../../../domain/payment.js';

const STATUSES: PaymentStatus[] = ['FAILED', 'PENDING', 'SUCCEEDED'];

@Schema({ collection: 'payments', timestamps: true })
export class MongoPayment {
  @Prop({ min: 1, required: true, type: Number })
  amount!: number;

  createdAt!: Date;

  @Prop({ lowercase: true, required: true, trim: true, type: String })
  currency!: string;

  @Prop({ index: { sparse: true, unique: true }, type: String })
  externalId?: string;

  @Prop({ required: true, type: String })
  orderId!: string;

  @Prop({ default: 'PENDING', enum: STATUSES, required: true, type: String })
  status!: PaymentStatus;

  updatedAt!: Date;
}

export const MongoPaymentSchema = SchemaFactory.createForClass(MongoPayment);

MongoPaymentSchema.index(
  { orderId: 1 },
  { partialFilterExpression: { status: 'PENDING' }, unique: true },
);
