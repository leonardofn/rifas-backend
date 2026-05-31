import { RaffleStatus } from '@shared/enums/ruffle-status';
import { bigintTransformer, numericTransformer } from '@shared/typeorm/column-transformers';
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
import { User } from './user.entity';

@Entity('raffles')
@Check('CHK_raffles_numbers', 'start_number <= end_number')
export class Raffle {
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id!: number;

  @Column({
    name: 'public_id',
    type: 'varchar',
    length: 16,
    unique: true,
    generatedType: 'STORED',
    asExpression: "'RAF_' || lpad(id::text, 12, '0')"
  })
  publicId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'start_number', type: 'int' })
  startNumber!: number;

  @Column({ name: 'end_number', type: 'int' })
  endNumber!: number;

  @Column({
    name: 'price_per_number',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer
  })
  pricePerNumber!: number;

  @Column({ type: 'enum', enum: RaffleStatus, default: RaffleStatus.PENDING })
  status!: RaffleStatus;

  @Column({
    name: 'total_collected',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer
  })
  totalCollected!: number;

  @Column({ name: 'draw_date', type: 'timestamptz', nullable: true })
  drawDate!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;
}
