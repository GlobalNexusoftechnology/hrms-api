import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784816589089 implements MigrationInterface {
    name = 'Updates1784816589089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."resignations_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'EXECUTED')`);
        await queryRunner.query(`CREATE TABLE "resignations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "resignation_date" date NOT NULL, "requested_last_working_date" date NOT NULL, "approved_last_working_date" date, "reason" text NOT NULL, "remarks" text, "status" "public"."resignations_status_enum" NOT NULL DEFAULT 'PENDING', "approved_by" uuid, "approved_at" TIMESTAMP, "executed_by" uuid, "executed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_36e7319e4e0d982d122245ff56d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "resignations" ADD CONSTRAINT "FK_e8ae29a1e9883855b5e02ceac99" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resignations" DROP CONSTRAINT "FK_e8ae29a1e9883855b5e02ceac99"`);
        await queryRunner.query(`DROP TABLE "resignations"`);
        await queryRunner.query(`DROP TYPE "public"."resignations_status_enum"`);
    }

}
