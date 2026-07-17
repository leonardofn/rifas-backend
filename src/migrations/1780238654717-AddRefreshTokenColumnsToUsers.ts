import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRefreshTokenColumnsToUsers1780238654717 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'refresh_token_hash',
        type: 'varchar',
        length: '255',
        isNullable: true
      }),
      new TableColumn({
        name: 'refresh_token_expires_at',
        type: 'timestamp with time zone',
        isNullable: true
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', ['refresh_token_hash', 'refresh_token_expires_at']);
  }
}
