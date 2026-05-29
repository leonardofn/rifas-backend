import { SubscriptionStatus } from '@shared/enums/subscription-status';
import { bigintTransformer } from '@shared/typeorm/column-transformers';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { Plan } from './plan.entity';
import { User } from './user.entity';

@Entity('user_subscriptions')
@Check('CHK_user_subscriptions_dates', 'ends_at IS NULL OR ends_at >= starts_at')
export class UserSubscription {
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Plan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @Column({ name: 'starts_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  autoRenew!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
