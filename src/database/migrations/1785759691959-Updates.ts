import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785759691959 implements MigrationInterface {
    name = 'Updates1785759691959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "break_start_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "break_end_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "allow_break_time" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "max_allowed_break_minutes" integer NOT NULL DEFAULT '60'`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_work_status_enum" AS ENUM('WORKING', 'ON_BREAK', 'NOT_WORKING')`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD "work_status" "public"."attendances_work_status_enum" NOT NULL DEFAULT 'NOT_WORKING'`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD "total_break_minutes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD "last_break_start" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD "last_break_end" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendances" DROP COLUMN "last_break_end"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP COLUMN "last_break_start"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP COLUMN "total_break_minutes"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP COLUMN "work_status"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_work_status_enum"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "max_allowed_break_minutes"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "allow_break_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "break_end_time" TIME`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "break_start_time" TIME`);
    }

}
