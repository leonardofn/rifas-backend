import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableCheck,
  TableForeignKey
} from 'typeorm';

export class CreateUserSubscriptions1748390400005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_subscriptions',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'user_id',
            type: 'bigint'
          },
          {
            name: 'plan_id',
            type: 'bigint'
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'active', 'cancelled', 'expired'],
            enumName: 'user_subscriptions_status_enum',
            default: "'active'"
          },
          {
            name: 'starts_at',
            type: 'timestamp with time zone',
            default: 'now()'
          },
          {
            name: 'ends_at',
            type: 'timestamp with time zone',
            isNullable: true
          },
          {
            name: 'auto_renew',
            type: 'boolean',
            default: false
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()'
          }
        ],
        checks: [
          new TableCheck({
            name: 'CHK_user_subscriptions_dates',
            expression: 'ends_at IS NULL OR ends_at >= starts_at'
          })
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_user_subscriptions_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }),
          new TableForeignKey({
            name: 'FK_user_subscriptions_plan_id',
            columnNames: ['plan_id'],
            referencedTableName: 'plans',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT'
          })
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_subscriptions', true, true);
  }
}
