import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalaryStructure1779782566398 implements MigrationInterface {
  name = 'CreateSalaryStructure1779782566398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "salary_structures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "basic_salary" numeric(12,2) NOT NULL, "hra" numeric(12,2) NOT NULL DEFAULT '0', "allowance" numeric(12,2) NOT NULL DEFAULT '0', "bonus" numeric(12,2) NOT NULL DEFAULT '0', "pf" numeric(12,2) NOT NULL DEFAULT '0', "esic" numeric(12,2) NOT NULL DEFAULT '0', "professional_tax" numeric(12,2) NOT NULL DEFAULT '0', "gross_salary" numeric(12,2) NOT NULL, "net_salary" numeric(12,2) NOT NULL, "effective_from" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e77e23919f090442d593192aeb8" UNIQUE ("employee_id"), CONSTRAINT "REL_e77e23919f090442d593192aeb" UNIQUE ("employee_id"), CONSTRAINT "PK_1800f745fd1ebe08981cd422acd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_structures" ADD CONSTRAINT "FK_e77e23919f090442d593192aeb8" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salary_structures" DROP CONSTRAINT "FK_e77e23919f090442d593192aeb8"`,
    );
    await queryRunner.query(`DROP TABLE "salary_structures"`);
  }
}
