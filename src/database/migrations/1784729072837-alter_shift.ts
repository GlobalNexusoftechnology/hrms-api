import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784729072837 implements MigrationInterface {
    name = 'Updates1784729072837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "break_start_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "break_end_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "total_break_minutes" integer NOT NULL DEFAULT '60'`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "include_break_in_working_hours" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "include_break_in_working_hours"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "total_break_minutes"`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "break_end_time" TIME`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "break_start_time" TIME`);
    }

}
