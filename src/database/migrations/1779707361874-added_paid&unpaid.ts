import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779707361874 implements MigrationInterface {
  name = 'CreateRoleTable1779707361874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD "paid_leaves_used" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD "unpaid_leaves_used" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP COLUMN "unpaid_leaves_used"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP COLUMN "paid_leaves_used"`,
    );
  }
}
