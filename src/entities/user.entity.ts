import { bigintTransformer } from '@shared/typeorm/column-transformers';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false
  })
  refreshTokenHash!: string | null;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamptz', nullable: true, select: false })
  refreshTokenExpiresAt!: Date | null;

  @Column({
    name: 'password_reset_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false
  })
  passwordResetTokenHash!: string | null;

  @Column({
    name: 'password_reset_token_expires_at',
    type: 'timestamptz',
    nullable: true,
    select: false
  })
  passwordResetTokenExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
