import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784785311617 implements MigrationInterface {
    name = 'Updates1784785311617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."activity_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT', 'DOWNLOAD', 'UPLOAD', 'ASSIGN', 'UNASSIGN', 'GENERATE', 'EMAIL_SENT', 'RESTORE')`);
        await queryRunner.query(`CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "employee_id" uuid, "module" character varying(50), "action" "public"."activity_logs_action_enum" NOT NULL, "description" text NOT NULL, "entity_type" character varying(50), "entity_id" uuid, "old_value" jsonb, "new_value" jsonb, "metadata" jsonb, "ip_address" character varying(45), "user_agent" text, "request_method" character varying(10), "request_path" text, "status" character varying(20), "correlation_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "activity_logs"`);
        await queryRunner.query(`DROP TYPE "public"."activity_logs_action_enum"`);
    }

}
