import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779388143170 implements MigrationInterface {
  name = 'CreateRoleTable1779388143170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employees" ADD "joining_date" date`);
    await queryRunner.query(
      `CREATE TYPE "public"."employees_employment_type_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "employment_type" "public"."employees_employment_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "gender" "public"."employees_gender_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "employees" ADD "date_of_birth" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "date_of_birth"`,
    );
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."employees_gender_enum"`);
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "employment_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."employees_employment_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "joining_date"`,
    );
  }
}
