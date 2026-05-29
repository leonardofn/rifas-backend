import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { RaffleStatus } from './enums';
import { User } from './user.entity';

@Entity('raffles')
@Check('CHK_raffles_numbers', 'start_number <= end_number')
export class Raffle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
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

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

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

  @Column({ name: 'price_per_number', type: 'numeric', precision: 10, scale: 2 })
  pricePerNumber!: number;

  @Column({ type: 'enum', enum: RaffleStatus, default: RaffleStatus.PENDING })
  status!: RaffleStatus;

  @Column({ name: 'total_collected', type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalCollected!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
