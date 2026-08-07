import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785245970540 implements MigrationInterface {
    name = 'Updates1785245970540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" ADD "break_start_time" TIME`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD "break_end_time" TIME`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "break_end_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "break_start_time"`);
    }

}
