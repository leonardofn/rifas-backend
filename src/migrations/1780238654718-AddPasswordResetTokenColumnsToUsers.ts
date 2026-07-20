import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPasswordResetTokenColumnsToUsers1780238654718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'password_reset_token_hash',
        type: 'varchar',
        length: '255',
        isNullable: true
      }),
      new TableColumn({
        name: 'password_reset_token_expires_at',
        type: 'timestamp with time zone',
        isNullable: true
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', [
      'password_reset_token_hash',
      'password_reset_token_expires_at'
    ]);
  }
}
