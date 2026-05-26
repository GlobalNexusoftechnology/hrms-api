import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalaryStructure1779787878393 implements MigrationInterface {
  name = 'CreateSalaryStructure1779787878393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payrolls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "gross_salary" numeric(12,2) NOT NULL, "net_salary" numeric(12,2) NOT NULL, "present_days" integer NOT NULL DEFAULT '0', "late_days" integer NOT NULL DEFAULT '0', "half_days" integer NOT NULL DEFAULT '0', "absent_days" integer NOT NULL DEFAULT '0', "paid_leaves" integer NOT NULL DEFAULT '0', "unpaid_leaves" integer NOT NULL DEFAULT '0', "absent_deduction" numeric(12,2) NOT NULL DEFAULT '0', "half_day_deduction" numeric(12,2) NOT NULL DEFAULT '0', "leave_deduction" numeric(12,2) NOT NULL DEFAULT '0', "overtime_amount" numeric(12,2) NOT NULL DEFAULT '0', "final_salary" numeric(12,2) NOT NULL, "is_paid" boolean NOT NULL DEFAULT false, "paid_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fc19dcf3522661435565b5ecf3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fec3a6e31e833dfefa4d958b38" ON "payrolls"  ("employee_id", "month", "year") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payrolls" ADD CONSTRAINT "FK_5145d894f823722a43ec3e1955e" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payrolls" DROP CONSTRAINT "FK_5145d894f823722a43ec3e1955e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fec3a6e31e833dfefa4d958b38"`,
    );
    await queryRunner.query(`DROP TABLE "payrolls"`);
  }
}
