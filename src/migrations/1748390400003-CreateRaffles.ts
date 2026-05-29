import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRaffles1748390400003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'raffles',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'public_id',
            type: 'varchar',
            length: '16',
            isUnique: true,
            generatedType: 'STORED',
            asExpression: "'RAF_' || lpad(id::text, 12, '0')"
          },
          {
            name: 'user_id',
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
            name: 'start_number',
            type: 'int'
          },
          {
            name: 'end_number',
            type: 'int'
          },
          {
            name: 'price_per_number',
            type: 'numeric',
            precision: 10,
            scale: 2
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'open', 'drawn', 'closed', 'cancelled'],
            enumName: 'raffles_status_enum',
            default: "'pending'"
          },
          {
            name: 'total_collected',
            type: 'numeric',
            precision: 10,
            scale: 2,
            default: 0
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
          {
            name: 'CHK_raffles_numbers',
            expression: 'start_number <= end_number'
          }
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_raffles_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          })
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('raffles', true, true);
  }
}
