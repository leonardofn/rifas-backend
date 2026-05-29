import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePrizes1748390400004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prizes',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'raffle_id',
            type: 'bigint',
            isNullable: true
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '1024',
            isNullable: true
          },
          {
            name: 'prize_order',
            type: 'int',
            default: 1
          },
          {
            name: 'winner_number',
            type: 'int',
            isNullable: true
          },
          {
            name: 'drawn_at',
            type: 'timestamp with time zone',
            isNullable: true
          },
          {
            name: 'value',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true
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
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_prizes_raffle_id',
            columnNames: ['raffle_id'],
            referencedTableName: 'raffles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          })
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('prizes', true, true);
  }
}
