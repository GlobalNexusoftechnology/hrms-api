import { MigrationInterface, QueryRunner } from "typeorm";

export class JobPosting1785087708249 implements MigrationInterface {
    name = 'JobPosting1785087708249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "interviews" DROP CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609"`);
        await queryRunner.query(`ALTER TABLE "interviews" RENAME COLUMN "candidate_id" TO "application_id"`);
        await queryRunner.query(`CREATE TYPE "public"."job_postings_employment_type_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT')`);
        await queryRunner.query(`CREATE TYPE "public"."job_postings_status_enum" AS ENUM('OPEN', 'CLOSED', 'DRAFT')`);
        await queryRunner.query(`CREATE TABLE "job_postings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "requirements" text NOT NULL, "department_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "employment_type" "public"."job_postings_employment_type_enum" NOT NULL, "salary_range" character varying, "experience_level" character varying, "status" "public"."job_postings_status_enum" NOT NULL DEFAULT 'OPEN', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dda635ece382c8ad2d90a179182" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."candidate_applications_status_enum" AS ENUM('APPLIED', 'SCREENING', 'ASSESSMENT_SCHEDULED', 'ASSESSMENT_CLEARED', 'TECHNICAL_SCHEDULED', 'TECHNICAL_CLEARED', 'HR_SCHEDULED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'HIRED')`);
        await queryRunner.query(`CREATE TABLE "candidate_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_id" uuid NOT NULL, "job_id" uuid NOT NULL, "status" "public"."candidate_applications_status_enum" NOT NULL DEFAULT 'APPLIED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_28ab47cd1defe47ecf047c7c1a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "candidates" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."candidates_status_enum"`);
        await queryRunner.query(`ALTER TABLE "job_postings" ADD CONSTRAINT "FK_cf838f9c48f90ad76d0f2d231e5" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_postings" ADD CONSTRAINT "FK_dc2e66036faffa745c7d98d0724" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_applications" ADD CONSTRAINT "FK_bdc76c70bcfed3f7c3be7d826f0" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_applications" ADD CONSTRAINT "FK_426118a09489215e23582bd5187" FOREIGN KEY ("job_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD CONSTRAINT "FK_77f7078daea9f2b36e9ff761bd1" FOREIGN KEY ("application_id") REFERENCES "candidate_applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "interviews" DROP CONSTRAINT "FK_77f7078daea9f2b36e9ff761bd1"`);
        await queryRunner.query(`ALTER TABLE "candidate_applications" DROP CONSTRAINT "FK_426118a09489215e23582bd5187"`);
        await queryRunner.query(`ALTER TABLE "candidate_applications" DROP CONSTRAINT "FK_bdc76c70bcfed3f7c3be7d826f0"`);
        await queryRunner.query(`ALTER TABLE "job_postings" DROP CONSTRAINT "FK_dc2e66036faffa745c7d98d0724"`);
        await queryRunner.query(`ALTER TABLE "job_postings" DROP CONSTRAINT "FK_cf838f9c48f90ad76d0f2d231e5"`);
        await queryRunner.query(`CREATE TYPE "public"."candidates_status_enum" AS ENUM('APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'HIRED', 'ASSESSMENT_SCHEDULED', 'ASSESSMENT_CLEARED', 'TECHNICAL_SCHEDULED', 'TECHNICAL_CLEARED', 'HR_SCHEDULED')`);
        await queryRunner.query(`ALTER TABLE "candidates" ADD "status" "public"."candidates_status_enum" NOT NULL DEFAULT 'APPLIED'`);
        await queryRunner.query(`DROP TABLE "candidate_applications"`);
        await queryRunner.query(`DROP TYPE "public"."candidate_applications_status_enum"`);
        await queryRunner.query(`DROP TABLE "job_postings"`);
        await queryRunner.query(`DROP TYPE "public"."job_postings_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."job_postings_employment_type_enum"`);
        await queryRunner.query(`ALTER TABLE "interviews" RENAME COLUMN "application_id" TO "candidate_id"`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
