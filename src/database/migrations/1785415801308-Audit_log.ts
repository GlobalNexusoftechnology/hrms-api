import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785415801308 implements MigrationInterface {
    name = 'Updates1785415801308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_severity_enum" AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "correlation_id" uuid, "session_id" uuid, "organization_id" uuid, "branch_id" uuid, "user_id" character varying(100), "role_id" uuid, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_name" character varying(100) NOT NULL, "entity_id" uuid NOT NULL, "version_number" integer NOT NULL DEFAULT '1', "status" integer, "duration" integer, "severity" "public"."audit_logs_severity_enum" NOT NULL DEFAULT 'INFO', "reason" character varying(255), "changed_fields" jsonb, "old_values" jsonb, "new_values" jsonb, "ip_address" character varying(45), "browser" character varying(100), "os" character varying(100), "device" character varying(100), "source" character varying(50), "endpoint" character varying(255), "method" character varying(10), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auth_logs_event_enum" AS ENUM('LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'TOKEN_REFRESH', 'MFA', 'ACCOUNT_LOCK')`);
        await queryRunner.query(`CREATE TYPE "public"."auth_logs_status_enum" AS ENUM('SUCCESS', 'FAILED', 'LOCKED')`);
        await queryRunner.query(`CREATE TABLE "auth_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "session_id" uuid, "event" "public"."auth_logs_event_enum" NOT NULL, "status" "public"."auth_logs_status_enum" NOT NULL, "ip_address" character varying(45), "device" text, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4ee581a4a56f10b64ffbfc1779" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "old_value"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "new_value"`);
        await queryRunner.query(`ALTER TABLE "organization_addresses" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organization_addresses" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "organization_taxes" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organization_taxes" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "organization_settings" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organization_settings" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "organization_documents" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organization_documents" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "version" integer NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organization_documents" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization_documents" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organization_settings" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization_settings" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organization_taxes" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization_taxes" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "organization_addresses" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization_addresses" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "new_value" jsonb`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "metadata" jsonb`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "old_value" jsonb`);
        await queryRunner.query(`DROP TABLE "auth_logs"`);
        await queryRunner.query(`DROP TYPE "public"."auth_logs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."auth_logs_event_enum"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_severity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    }

}
