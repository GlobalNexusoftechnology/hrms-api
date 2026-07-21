import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784653704336 implements MigrationInterface {
    name = 'Updates1784653704336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "display_name" character varying`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "description" text`);
        await queryRunner.query(`CREATE TYPE "public"."branches_branch_type_enum" AS ENUM('HEAD_OFFICE', 'REGIONAL_OFFICE', 'BRANCH_OFFICE', 'WAREHOUSE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "branch_type" "public"."branches_branch_type_enum" NOT NULL DEFAULT 'BRANCH_OFFICE'`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "phone" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."branches_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED')`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "status" "public"."branches_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "line1" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "city" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "state" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "country" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "zip" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "zip" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "country" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "state" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "city" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "line1" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."branches_status_enum"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "branch_type"`);
        await queryRunner.query(`DROP TYPE "public"."branches_branch_type_enum"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

}
