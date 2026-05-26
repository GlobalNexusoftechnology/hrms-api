import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779572026669 implements MigrationInterface {
  name = 'CreateRoleTable1779572026669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holidays" DROP CONSTRAINT "UQ_40dfddee0c0d7125c767d8962b1"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holidays" ADD CONSTRAINT "UQ_40dfddee0c0d7125c767d8962b1" UNIQUE ("date")`,
    );
  }
}
