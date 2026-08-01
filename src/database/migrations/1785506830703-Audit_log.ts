import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785506830703 implements MigrationInterface {
    name = 'Updates1785506830703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_dba930f6b2ad135562d24eeae7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_515d3bcf12a3d6d864d8116137"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dabdd43cc478c02f7881b902ee"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "created_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "updated_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "deleted_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "user_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "entity_name"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "entity_name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "reason" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "browser"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "browser" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "os"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "os" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "device"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "device" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "endpoint"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "endpoint" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "endpoint"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "endpoint" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "device"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "device" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "os"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "os" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "browser"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "browser" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "reason" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "entity_name"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "entity_name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "user_id" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "version" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "deleted_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "updated_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "created_by_user_id" uuid`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_dabdd43cc478c02f7881b902ee" ON "auth_logs" USING btree ("id", "tenant_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_515d3bcf12a3d6d864d8116137" ON "audit_logs" USING btree ("id", "tenant_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_dba930f6b2ad135562d24eeae7" ON "activity_logs" USING btree ("id", "tenant_id") `);
    }

}
