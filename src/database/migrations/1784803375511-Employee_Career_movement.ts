import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784803375511 implements MigrationInterface {
    name = 'Updates1784803375511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employee_career_movements_movement_type_enum" AS ENUM('PROMOTION', 'DEMOTION', 'TRANSFER', 'DESIGNATION_CHANGE', 'DEPARTMENT_CHANGE', 'TEAM_CHANGE', 'ROLE_CHANGE', 'BRANCH_CHANGE', 'SHIFT_CHANGE', 'SALARY_REVISION', 'CONFIRMATION', 'ACTING_ASSIGNMENT')`);
        await queryRunner.query(`CREATE TYPE "public"."employee_career_movements_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXECUTED')`);
        await queryRunner.query(`CREATE TABLE "employee_career_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "movement_type" "public"."employee_career_movements_movement_type_enum" NOT NULL, "status" "public"."employee_career_movements_status_enum" NOT NULL DEFAULT 'PENDING', "effective_date" date NOT NULL, "old_branch_id" uuid, "old_department_id" uuid, "old_designation_id" uuid, "old_role_id" uuid, "old_manager_id" uuid, "old_shift_id" uuid, "old_salary_structure_id" uuid, "new_branch_id" uuid, "new_department_id" uuid, "new_designation_id" uuid, "new_role_id" uuid, "new_manager_id" uuid, "new_shift_id" uuid, "new_salary_structure_id" uuid, "reason" text, "remarks" text, "reference_number" character varying(150), "attachment_document_id" uuid, "impact_payroll" boolean NOT NULL DEFAULT false, "impact_permissions" boolean NOT NULL DEFAULT false, "requested_by" uuid, "approved_by" uuid, "executed_by" uuid, "requested_at" TIMESTAMP, "approved_at" TIMESTAMP, "executed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_305ac2535438a58c03360ffd32f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_career_movements" ADD CONSTRAINT "FK_330be213f818b51af3da00c0fac" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_career_movements" DROP CONSTRAINT "FK_330be213f818b51af3da00c0fac"`);
        await queryRunner.query(`DROP TABLE "employee_career_movements"`);
        await queryRunner.query(`DROP TYPE "public"."employee_career_movements_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employee_career_movements_movement_type_enum"`);
    }

}
