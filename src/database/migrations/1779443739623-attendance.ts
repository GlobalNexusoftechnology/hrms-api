import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleTable1779443739623 implements MigrationInterface {
    name = 'CreateRoleTable1779443739623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."attendances_status_enum" AS ENUM('present', 'absent', 'late', 'halfDay', 'leave', 'wfh')`);
        await queryRunner.query(`CREATE TABLE "attendances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "date" date NOT NULL, "check_in" TIMESTAMP, "check_out" TIMESTAMP, "early_checkout_reason" text, "worked_minutes" integer NOT NULL DEFAULT '0', "overtime_minutes" integer NOT NULL DEFAULT '0', "status" "public"."attendances_status_enum" NOT NULL DEFAULT 'present', "check_in_location" text, "check_out_location" text, "is_auto_checkout" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7797173c5d5349271c80c7122c" ON "attendances"  ("employee_id", "date") `);
        await queryRunner.query(`CREATE TYPE "public"."attendance_corrections_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "attendance_corrections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "attendance_id" uuid NOT NULL, "current_check_in" TIMESTAMP, "current_check_out" TIMESTAMP, "requested_check_in" TIMESTAMP, "requested_check_out" TIMESTAMP, "reason" text NOT NULL, "status" "public"."attendance_corrections_status_enum" NOT NULL DEFAULT 'pending', "reviewed_by_id" uuid, "review_comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4774e9510f6e31573910183527d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_43dca8b4751d7449a38b583991c" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_corrections" ADD CONSTRAINT "FK_338617dcc7aa29158761777fc12" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_corrections" ADD CONSTRAINT "FK_094dcbcfbf9901f13544a78df28" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_corrections" ADD CONSTRAINT "FK_b7c13085ba5bb7a81fc86f0f345" FOREIGN KEY ("reviewed_by_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_corrections" DROP CONSTRAINT "FK_b7c13085ba5bb7a81fc86f0f345"`);
        await queryRunner.query(`ALTER TABLE "attendance_corrections" DROP CONSTRAINT "FK_094dcbcfbf9901f13544a78df28"`);
        await queryRunner.query(`ALTER TABLE "attendance_corrections" DROP CONSTRAINT "FK_338617dcc7aa29158761777fc12"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_43dca8b4751d7449a38b583991c"`);
        await queryRunner.query(`DROP TABLE "attendance_corrections"`);
        await queryRunner.query(`DROP TYPE "public"."attendance_corrections_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7797173c5d5349271c80c7122c"`);
        await queryRunner.query(`DROP TABLE "attendances"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_status_enum"`);
    }

}
