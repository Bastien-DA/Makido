import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export interface OrderCustomization {
  groupName: string;
  optionName: string;
  quantity: number;
  includedQuantity: number;
}

export interface OrderLine {
  articleId: string;
  name: string;
  quantity: number;
  ingredients: string[];
  customizations: OrderCustomization[];
}

@Entity('orders')
@Index(['reference', 'createdAt'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column()
  requestHash: string;

  @Column()
  reference: string;

  @Column()
  shortReference: string;

  @Column({ type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @Column({ type: 'bigint' })
  totalCents: string;

  @Column({ type: 'jsonb' })
  items: OrderLine[];

  @Column({ default: false })
  paymentConfirmed: boolean;

  @Column({ default: false })
  ticketSent: boolean;
}
