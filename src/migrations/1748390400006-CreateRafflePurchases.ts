import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableUnique
} from 'typeorm';

export class CreateRafflePurchases1748390400006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'raffle_purchases',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'number_bought',
            type: 'int'
          },
          {
            name: 'purchase_datetime',
            type: 'timestamp with time zone',
            default: 'now()'
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['pending', 'paid', 'cancelled'],
            enumName: 'raffle_purchases_payment_status_enum',
            default: "'pending'"
          },
          {
            name: 'amount_paid',
            type: 'numeric',
            precision: 10,
            scale: 2
          },
          {
            name: 'raffle_id',
            type: 'bigint',
            isNullable: true
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: true
          }
        ],
        uniques: [
          new TableUnique({
            name: 'uq_raffle_purchases_raffle_number',
            columnNames: ['raffle_id', 'number_bought']
          })
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_raffle_purchases_raffle_id',
            columnNames: ['raffle_id'],
            referencedTableName: 'raffles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }),
          new TableForeignKey({
            name: 'FK_raffle_purchases_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL'
          })
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('raffle_purchases', true, true);
  }
}
