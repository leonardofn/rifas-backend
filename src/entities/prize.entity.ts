import { bigintTransformer, numericTransformer } from '@shared/typeorm/column-transformers';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { Raffle } from './raffle.entity';

@Entity('prizes')
export class Prize {
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'prize_order', type: 'int', default: 1 })
  prizeOrder!: number;

  @Column({ name: 'winner_number', type: 'int', nullable: true })
  winnerNumber!: number | null;

  @Column({ name: 'drawn_at', type: 'timestamptz', nullable: true })
  drawnAt!: Date | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: numericTransformer
  })
  value!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Raffle, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raffle_id' })
  raffle!: Raffle | null;
}
