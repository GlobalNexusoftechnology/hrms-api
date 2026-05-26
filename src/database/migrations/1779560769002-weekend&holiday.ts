import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779560769002 implements MigrationInterface {
  name = 'CreateRoleTable1779560769002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."holidays_type_enum" AS ENUM('NATIONAL', 'FESTIVAL', 'BANK', 'COMPANY', 'OPTIONAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "date" date NOT NULL, "type" "public"."holidays_type_enum" NOT NULL, "isPaid" boolean NOT NULL DEFAULT true, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_40dfddee0c0d7125c767d8962b1" UNIQUE ("date"), CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."weekend_settings_day_enum" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."weekend_settings_weeknumber_enum" AS ENUM('ALL', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "weekend_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day" "public"."weekend_settings_day_enum" NOT NULL, "weekNumber" "public"."weekend_settings_weeknumber_enum" NOT NULL, "is_off" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_152ff99a00945b3eaff2f62b11f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_483ed97cd4cd43ab4a117516b6" ON "attendances"  ("id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_483ed97cd4cd43ab4a117516b6"`,
    );
    await queryRunner.query(`DROP TABLE "weekend_settings"`);
    await queryRunner.query(
      `DROP TYPE "public"."weekend_settings_weeknumber_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."weekend_settings_day_enum"`);
    await queryRunner.query(`DROP TABLE "holidays"`);
    await queryRunner.query(`DROP TYPE "public"."holidays_type_enum"`);
  }
}
