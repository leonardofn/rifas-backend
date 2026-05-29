import { type MigrationInterface, type QueryRunner, Table, TableCheck } from 'typeorm';

export class CreatePlans1748390400002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'plans',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'monthly_price',
            type: 'numeric',
            precision: 10,
            scale: 2,
            default: 0
          },
          {
            name: 'raffle_limit_per_month',
            type: 'int',
            isNullable: true
          },
          {
            name: 'max_numbers_per_raffle',
            type: 'int',
            isNullable: true
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true
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
            name: 'CHK_plans_monthly_price',
            expression: 'monthly_price >= 0'
          }),
          new TableCheck({
            name: 'CHK_plans_raffle_limit',
            expression: 'raffle_limit_per_month IS NULL OR raffle_limit_per_month >= 0'
          }),
          new TableCheck({
            name: 'CHK_plans_max_numbers',
            expression: 'max_numbers_per_raffle IS NULL OR max_numbers_per_raffle > 0'
          })
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plans');
  }
}
