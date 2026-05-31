import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDrawDateColumnToRaffleTable1780238654716 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'raffles',
      new TableColumn({
        name: 'draw_date',
        type: 'timestamp with time zone',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('raffles', 'draw_date');
  }
}
