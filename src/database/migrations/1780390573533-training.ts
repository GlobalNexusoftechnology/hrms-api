import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalaryStructure1780390573533 implements MigrationInterface {
  name = 'CreateSalaryStructure1780390573533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."training_materials_type_enum" AS ENUM('PDF', 'VIDEO', 'LINK', 'DOCUMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "training_materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "training_id" uuid NOT NULL, "title" character varying NOT NULL, "type" "public"."training_materials_type_enum" NOT NULL, "file_url" text, "video_url" text, "sort_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c5f58bee5ce1af3378a5d3e671" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."trainings_type_enum" AS ENUM('MANDATORY', 'OPTIONAL', 'ONBOARDING', 'CERTIFICATION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "trainings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "type" "public"."trainings_type_enum" NOT NULL, "department_id" uuid, "created_by" uuid NOT NULL, "start_date" TIMESTAMP, "end_date" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_b67237502b175163e47dc85018d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."training_assignments_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "training_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "training_id" uuid NOT NULL, "employee_id" uuid NOT NULL, "status" "public"."training_assignments_status_enum" NOT NULL DEFAULT 'PENDING', "progress_percentage" integer NOT NULL DEFAULT '0', "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, CONSTRAINT "PK_c05e77c7a449a96eb76160a98f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_materials" ADD CONSTRAINT "FK_7deb98c950b83e424fe689697cd" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" ADD CONSTRAINT "FK_63604bda4d636b574c406538f85" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" ADD CONSTRAINT "FK_483f348fd2ff1235cd33a8c3303" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_assignments" ADD CONSTRAINT "FK_cb4fb28a2337f3b516b3ceafa4f" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_assignments" ADD CONSTRAINT "FK_2c8aec52b676f69e8b641365f52" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "training_assignments" DROP CONSTRAINT "FK_2c8aec52b676f69e8b641365f52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_assignments" DROP CONSTRAINT "FK_cb4fb28a2337f3b516b3ceafa4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" DROP CONSTRAINT "FK_483f348fd2ff1235cd33a8c3303"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" DROP CONSTRAINT "FK_63604bda4d636b574c406538f85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_materials" DROP CONSTRAINT "FK_7deb98c950b83e424fe689697cd"`,
    );
    await queryRunner.query(`DROP TABLE "training_assignments"`);
    await queryRunner.query(
      `DROP TYPE "public"."training_assignments_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "trainings"`);
    await queryRunner.query(`DROP TYPE "public"."trainings_type_enum"`);
    await queryRunner.query(`DROP TABLE "training_materials"`);
    await queryRunner.query(
      `DROP TYPE "public"."training_materials_type_enum"`,
    );
  }
}
