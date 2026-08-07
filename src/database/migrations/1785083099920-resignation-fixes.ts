import { MigrationInterface, QueryRunner } from "typeorm";

export class ResignationFixes1785083099920 implements MigrationInterface {
    name = 'ResignationFixes1785083099920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_settings" ADD "notice_period_days" integer NOT NULL DEFAULT '30'`);
        await queryRunner.query(`ALTER TABLE "resignations" ADD "is_shortfall" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "resignations" ADD "shortfall_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resignations" DROP COLUMN "shortfall_reason"`);
        await queryRunner.query(`ALTER TABLE "resignations" DROP COLUMN "is_shortfall"`);
        await queryRunner.query(`ALTER TABLE "organization_settings" DROP COLUMN "notice_period_days"`);
    }

}
