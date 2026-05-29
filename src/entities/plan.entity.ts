import { bigintTransformer, numericTransformer } from '@shared/typeorm/column-transformers';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('plans')
@Check('CHK_plans_monthly_price', 'monthly_price >= 0')
@Check('CHK_plans_raffle_limit', 'raffle_limit_per_month IS NULL OR raffle_limit_per_month >= 0')
@Check('CHK_plans_max_numbers', 'max_numbers_per_raffle IS NULL OR max_numbers_per_raffle > 0')
export class Plan {
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'monthly_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer
  })
  monthlyPrice!: number;

  @Column({ name: 'raffle_limit_per_month', type: 'int', nullable: true })
  raffleLimitPerMonth!: number | null;

  @Column({ name: 'max_numbers_per_raffle', type: 'int', nullable: true })
  maxNumbersPerRaffle!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
