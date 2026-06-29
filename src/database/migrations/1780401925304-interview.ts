import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalaryStructure1780401925304 implements MigrationInterface {
  name = 'CreateSalaryStructure1780401925304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."candidates_status_enum" AS ENUM('APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'HIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "candidates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "mobile" character varying NOT NULL, "resume_url" text, "experience" text, "current_company" text, "current_ctc" numeric, "expected_ctc" numeric, "notice_period" text, "skills" text, "source" text, "status" "public"."candidates_status_enum" NOT NULL DEFAULT 'APPLIED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" text, CONSTRAINT "UQ_c0de76a18c2a505ceb016746822" UNIQUE ("email"), CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_status_enum" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_id" uuid NOT NULL, "interviewer_id" uuid NOT NULL, "round_name" character varying NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, "meeting_link" text, "remarks" text, "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'SCHEDULED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interview_feedbacks_recommendation_enum" AS ENUM('SELECT', 'REJECT', 'HOLD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interview_feedbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "interview_id" uuid NOT NULL, "created_by" uuid NOT NULL, "rating" integer NOT NULL DEFAULT '0', "technical_score" integer NOT NULL DEFAULT '0', "communication_score" integer NOT NULL DEFAULT '0', "remarks" text, "recommendation" "public"."interview_feedbacks_recommendation_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b823686267a3edc906e8720b0c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_dab087b7d082364ae58637eafbb" FOREIGN KEY ("interviewer_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "FK_f4be72ab3ac5b4273521df56cc9" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "FK_ecf1613cc5c484d5e63a5b1788d" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interview_feedbacks" DROP CONSTRAINT "FK_ecf1613cc5c484d5e63a5b1788d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interview_feedbacks" DROP CONSTRAINT "FK_f4be72ab3ac5b4273521df56cc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_dab087b7d082364ae58637eafbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609"`,
    );
    await queryRunner.query(`DROP TABLE "interview_feedbacks"`);
    await queryRunner.query(
      `DROP TYPE "public"."interview_feedbacks_recommendation_enum"`,
    );
    await queryRunner.query(`DROP TABLE "interviews"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
    await queryRunner.query(`DROP TABLE "candidates"`);
    await queryRunner.query(`DROP TYPE "public"."candidates_status_enum"`);
  }
}
