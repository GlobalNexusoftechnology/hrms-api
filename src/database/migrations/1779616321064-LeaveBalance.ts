import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779616321064 implements MigrationInterface {
  name = 'CreateRoleTable1779616321064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "leave_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "monthly_credit" integer NOT NULL DEFAULT '2', "carry_forward" integer NOT NULL DEFAULT '0', "used_leaves" integer NOT NULL DEFAULT '0', "remaining_leaves" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a1d90dff48fb2bfd23a7163d077" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d953f74b03a714f336578a88b2" ON "leave_balances"  ("employee_id", "month", "year") `,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_2f8aebce74941a2e2168e94ba68" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_2f8aebce74941a2e2168e94ba68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d953f74b03a714f336578a88b2"`,
    );
    await queryRunner.query(`DROP TABLE "leave_balances"`);
  }
}
