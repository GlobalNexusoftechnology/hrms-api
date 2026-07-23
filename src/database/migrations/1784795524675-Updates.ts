import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784795524675 implements MigrationInterface {
    name = 'Updates1784795524675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee_banks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "bank_name" character varying(150) NOT NULL, "account_holder_name" character varying(150) NOT NULL, "account_number" character varying(50) NOT NULL, "ifsc" character varying(20) NOT NULL, "branch_name" character varying(100), "is_primary" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7366f17581f5331e47851898f6f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_education" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "degree" character varying(150) NOT NULL, "institution" character varying(200) NOT NULL, "passing_year" integer NOT NULL, "grade" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_29e13ff7f69077fc42445b0c305" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_experience" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "company_name" character varying(150) NOT NULL, "designation" character varying(100) NOT NULL, "from_date" date NOT NULL, "to_date" date, "reason_for_leaving" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eef81c010bd5d671ec7a096f4c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_families" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "relationship" character varying(100) NOT NULL, "date_of_birth" date, "is_dependent" boolean NOT NULL DEFAULT false, "phone" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_44f8ef3efbbb12a58fb6edce4ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employee_skills_proficiency_level_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`);
        await queryRunner.query(`CREATE TABLE "employee_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "skill_name" character varying(150) NOT NULL, "proficiency_level" "public"."employee_skills_proficiency_level_enum" NOT NULL, "certification_details" character varying(255), "year" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e74b1e2cad6e8aba5368ff116a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_banks" ADD CONSTRAINT "FK_9edeb03ee4e3b49a1f2b64fa575" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_education" ADD CONSTRAINT "FK_7677d15e8f39cd824f6fa94fdb8" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_experience" ADD CONSTRAINT "FK_9a0805d0f6c0c9e4b6d930a55b3" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_families" ADD CONSTRAINT "FK_ea9485eaaaa20fcd335c920b9e3" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_skills" ADD CONSTRAINT "FK_ec91e85c3d675deabbbf6ac9c1a" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_skills" DROP CONSTRAINT "FK_ec91e85c3d675deabbbf6ac9c1a"`);
        await queryRunner.query(`ALTER TABLE "employee_families" DROP CONSTRAINT "FK_ea9485eaaaa20fcd335c920b9e3"`);
        await queryRunner.query(`ALTER TABLE "employee_experience" DROP CONSTRAINT "FK_9a0805d0f6c0c9e4b6d930a55b3"`);
        await queryRunner.query(`ALTER TABLE "employee_education" DROP CONSTRAINT "FK_7677d15e8f39cd824f6fa94fdb8"`);
        await queryRunner.query(`ALTER TABLE "employee_banks" DROP CONSTRAINT "FK_9edeb03ee4e3b49a1f2b64fa575"`);
        await queryRunner.query(`DROP TABLE "employee_skills"`);
        await queryRunner.query(`DROP TYPE "public"."employee_skills_proficiency_level_enum"`);
        await queryRunner.query(`DROP TABLE "employee_families"`);
        await queryRunner.query(`DROP TABLE "employee_experience"`);
        await queryRunner.query(`DROP TABLE "employee_education"`);
        await queryRunner.query(`DROP TABLE "employee_banks"`);
    }

}
