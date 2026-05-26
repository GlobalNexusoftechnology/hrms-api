import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779476128871 implements MigrationInterface {
  name = 'CreateRoleTable1779476128871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."leaves_type_enum" AS ENUM('CASUAL', 'SICK', 'PAID', 'UNPAID', 'EMERGENCY', 'MATERNITY', 'PATERNITY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leaves_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leaves" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "type" "public"."leaves_type_enum" NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "reason" text NOT NULL, "status" "public"."leaves_status_enum" NOT NULL DEFAULT 'PENDING', "reviewed_by_id" uuid, "review_comment" text, "reviewed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4153ec7270da3d07efd2e11e2a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "leaves" ADD CONSTRAINT "FK_29d5827b1f3a86dc19288ec69a5" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leaves" ADD CONSTRAINT "FK_b210cc3d4ac04227754ff647d3b" FOREIGN KEY ("reviewed_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leaves" DROP CONSTRAINT "FK_b210cc3d4ac04227754ff647d3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leaves" DROP CONSTRAINT "FK_29d5827b1f3a86dc19288ec69a5"`,
    );
    await queryRunner.query(`DROP TABLE "leaves"`);
    await queryRunner.query(`DROP TYPE "public"."leaves_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."leaves_type_enum"`);
  }
}
