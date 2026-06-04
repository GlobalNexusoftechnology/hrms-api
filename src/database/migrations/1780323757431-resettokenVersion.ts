import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalaryStructure1780323757431 implements MigrationInterface {
  name = 'CreateSalaryStructure1780323757431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "password_version" integer NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "password_version"`,
    );
  }
}
