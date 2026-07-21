import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784643403089 implements MigrationInterface {
    name = 'Updates1784643403089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "created_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "updated_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "authority_level" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."authority_level" IS 'Higher value = Higher authority. MAX is 100.'`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "is_system" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."is_system" IS 'System roles cannot be deleted'`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."is_protected" IS 'Protected roles cannot have their name, permissions, or authority level modified'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "roles"."is_protected" IS 'Protected roles cannot be deleted, renamed, deactivated, or have permissions removed'`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."is_system" IS 'System roles cannot be deleted'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "is_system"`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."authority_level" IS 'Higher value = Higher authority. MAX is 100.'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "authority_level"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updated_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "created_by_user_id"`);
    }

}
