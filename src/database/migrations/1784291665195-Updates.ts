import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784291665195 implements MigrationInterface {
    name = 'Updates1784291665195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "course_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "course_id" uuid NOT NULL, "employee_id" uuid NOT NULL, "progress_percentage" numeric NOT NULL DEFAULT '0', "is_completed" boolean NOT NULL DEFAULT false, "due_date" date, "completed_at" TIMESTAMP, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_601138f857c63944c5972108dff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "department_id" uuid, "created_by" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."course_materials_type_enum" AS ENUM('PDF', 'VIDEO', 'LINK', 'DOCUMENT')`);
        await queryRunner.query(`CREATE TABLE "course_materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "topic_id" uuid NOT NULL, "title" character varying NOT NULL, "type" "public"."course_materials_type_enum" NOT NULL, "file_url" text, "sort_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b8d788301b7ea04c1cefc4bd2ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "module_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "sort_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d686362460203cc63b99129191a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "course_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "sort_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c195db0718e8845a6e09075ebc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assessment_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "optionText" text NOT NULL, "is_correct" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_52b8ef855d0d51a9022f7da26c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assessment_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assessment_id" uuid NOT NULL, "questionText" text NOT NULL, "sort_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b47caf1bca7fa7b888dd02cfe73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assessments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "module_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "passing_percentage" numeric NOT NULL DEFAULT '40', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_278b55ab730bb8603cbe03d454" UNIQUE ("module_id"), CONSTRAINT "PK_a3442bd80a00e9111cefca57f6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assessment_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "assessment_id" uuid NOT NULL, "score_percentage" numeric NOT NULL DEFAULT '0', "passed" boolean NOT NULL DEFAULT false, "attempted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3761b6653b00f7df0ca4c1049ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "module_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "module_id" uuid NOT NULL, "is_unlocked" boolean NOT NULL DEFAULT false, "is_completed" boolean NOT NULL DEFAULT false, "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_29f00069652b2ea973d36e6db99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "topic_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "topic_id" uuid NOT NULL, "is_completed" boolean NOT NULL DEFAULT false, "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c8051cdf2b8d481701e61825c1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD "late_minutes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "late_deduction" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "bonus_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "bonus_reason" text`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "deduction_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "deduction_reason" text`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP CONSTRAINT "FK_e77e23919f090442d593192aeb8"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP CONSTRAINT "UQ_e77e23919f090442d593192aeb8"`);
        await queryRunner.query(`ALTER TYPE "public"."candidates_status_enum" ADD VALUE 'ASSESSMENT_SCHEDULED'`);
        await queryRunner.query(`ALTER TYPE "public"."candidates_status_enum" ADD VALUE 'ASSESSMENT_CLEARED'`);
        await queryRunner.query(`ALTER TYPE "public"."candidates_status_enum" ADD VALUE 'TECHNICAL_SCHEDULED'`);
        await queryRunner.query(`ALTER TYPE "public"."candidates_status_enum" ADD VALUE 'TECHNICAL_CLEARED'`);
        await queryRunner.query(`ALTER TYPE "public"."candidates_status_enum" ADD VALUE 'HR_SCHEDULED'`);
        await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "round_name"`);
        await queryRunner.query(`CREATE TYPE "public"."interviews_round_name_enum" AS ENUM('ASSESSMENT', 'TECHNICAL', 'HR')`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD "round_name" "public"."interviews_round_name_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD CONSTRAINT "FK_e77e23919f090442d593192aeb8" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_assignments" ADD CONSTRAINT "FK_ced68e02ed45eb8c72cc1b42348" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_assignments" ADD CONSTRAINT "FK_cafd151493e2dd28cd71d1750e3" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_b0a306ca76ad64906bf5082775f" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_16fcd8ab8bc042688984d5b3934" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_materials" ADD CONSTRAINT "FK_fbad2b951de5c31198e7715cbe9" FOREIGN KEY ("topic_id") REFERENCES "course_topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_topics" ADD CONSTRAINT "FK_2c7b091f02796a08d96b701d839" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_modules" ADD CONSTRAINT "FK_81644557c2401f37fe9e884e884" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessment_options" ADD CONSTRAINT "FK_86a1be958f474e29f2da682811a" FOREIGN KEY ("question_id") REFERENCES "assessment_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessment_questions" ADD CONSTRAINT "FK_b8c94c86174f73f45aca9fee781" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_278b55ab730bb8603cbe03d4548" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessment_attempts" ADD CONSTRAINT "FK_bd0377723db4601da09a7de3152" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessment_attempts" ADD CONSTRAINT "FK_a6580a164dbc7b3232c8a2f063e" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "module_progress" ADD CONSTRAINT "FK_796963936027b119544934ff148" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "module_progress" ADD CONSTRAINT "FK_f8100e4c38116de5fce6d21b063" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "topic_progress" ADD CONSTRAINT "FK_d7a60e1dc75f1cb2c8210f5e512" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "topic_progress" ADD CONSTRAINT "FK_75331203e5eb5f2d6d4bfc8e838" FOREIGN KEY ("topic_id") REFERENCES "course_topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic_progress" DROP CONSTRAINT "FK_75331203e5eb5f2d6d4bfc8e838"`);
        await queryRunner.query(`ALTER TABLE "topic_progress" DROP CONSTRAINT "FK_d7a60e1dc75f1cb2c8210f5e512"`);
        await queryRunner.query(`ALTER TABLE "module_progress" DROP CONSTRAINT "FK_f8100e4c38116de5fce6d21b063"`);
        await queryRunner.query(`ALTER TABLE "module_progress" DROP CONSTRAINT "FK_796963936027b119544934ff148"`);
        await queryRunner.query(`ALTER TABLE "assessment_attempts" DROP CONSTRAINT "FK_a6580a164dbc7b3232c8a2f063e"`);
        await queryRunner.query(`ALTER TABLE "assessment_attempts" DROP CONSTRAINT "FK_bd0377723db4601da09a7de3152"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_278b55ab730bb8603cbe03d4548"`);
        await queryRunner.query(`ALTER TABLE "assessment_questions" DROP CONSTRAINT "FK_b8c94c86174f73f45aca9fee781"`);
        await queryRunner.query(`ALTER TABLE "assessment_options" DROP CONSTRAINT "FK_86a1be958f474e29f2da682811a"`);
        await queryRunner.query(`ALTER TABLE "course_modules" DROP CONSTRAINT "FK_81644557c2401f37fe9e884e884"`);
        await queryRunner.query(`ALTER TABLE "course_topics" DROP CONSTRAINT "FK_2c7b091f02796a08d96b701d839"`);
        await queryRunner.query(`ALTER TABLE "course_materials" DROP CONSTRAINT "FK_fbad2b951de5c31198e7715cbe9"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_16fcd8ab8bc042688984d5b3934"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_b0a306ca76ad64906bf5082775f"`);
        await queryRunner.query(`ALTER TABLE "course_assignments" DROP CONSTRAINT "FK_cafd151493e2dd28cd71d1750e3"`);
        await queryRunner.query(`ALTER TABLE "course_assignments" DROP CONSTRAINT "FK_ced68e02ed45eb8c72cc1b42348"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP CONSTRAINT "FK_e77e23919f090442d593192aeb8"`);
        await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "round_name"`);
        await queryRunner.query(`DROP TYPE "public"."interviews_round_name_enum"`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD "round_name" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."candidates_status_enum_old" AS ENUM('APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'HIRED')`);
        await queryRunner.query(`ALTER TABLE "candidates" ALTER COLUMN "status" TYPE "public"."candidates_status_enum_old" USING "status"::"text"::"public"."candidates_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."candidates_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."candidates_status_enum_old" RENAME TO "candidates_status_enum"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD CONSTRAINT "UQ_e77e23919f090442d593192aeb8" UNIQUE ("employee_id")`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD CONSTRAINT "FK_e77e23919f090442d593192aeb8" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "deduction_reason"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "deduction_amount"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "bonus_reason"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "bonus_amount"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "late_deduction"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP COLUMN "late_minutes"`);
        await queryRunner.query(`DROP TABLE "topic_progress"`);
        await queryRunner.query(`DROP TABLE "module_progress"`);
        await queryRunner.query(`DROP TABLE "assessment_attempts"`);
        await queryRunner.query(`DROP TABLE "assessments"`);
        await queryRunner.query(`DROP TABLE "assessment_questions"`);
        await queryRunner.query(`DROP TABLE "assessment_options"`);
        await queryRunner.query(`DROP TABLE "course_modules"`);
        await queryRunner.query(`DROP TABLE "course_topics"`);
        await queryRunner.query(`DROP TABLE "course_materials"`);
        await queryRunner.query(`DROP TYPE "public"."course_materials_type_enum"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "course_assignments"`);
    }

}
