import { PaymentStatus } from '@shared/enums/payment-status';
import { bigintTransformer, numericTransformer } from '@shared/typeorm/column-transformers';
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Raffle } from './raffle.entity';
import { User } from './user.entity';

@Entity('raffle_purchases')
@Unique('uq_raffle_purchases_raffle_number', ['raffleId', 'numberBought'])
export class RafflePurchase {
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id!: number;

  @Column({ name: 'number_bought', type: 'int' })
  numberBought!: number;

  @Column({
    name: 'purchase_datetime',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  purchaseDatetime!: Date;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus!: PaymentStatus;

  @Column({
    name: 'amount_paid',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer
  })
  amountPaid!: number;

  @Column({ name: 'raffle_id', type: 'bigint', nullable: true, transformer: bigintTransformer })
  raffleId!: number | null;

  @ManyToOne(() => Raffle, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raffle_id' })
  raffle!: Raffle | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;
}
