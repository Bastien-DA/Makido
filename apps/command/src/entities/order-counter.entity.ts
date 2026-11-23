import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('order_counters')
export class OrderCounter {
  @PrimaryColumn({ type: 'date' })
  day: string;

  @Column({ type: 'integer' })
  value: number;
}
