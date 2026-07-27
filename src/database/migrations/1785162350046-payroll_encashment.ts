import { MigrationInterface, QueryRunner } from "typeorm";

export class PayrollEncashment1785162350046 implements MigrationInterface {
    name = 'PayrollEncashment1785162350046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" ADD "max_allowed_overtime_minutes" integer NOT NULL DEFAULT '240'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "encashment_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "encashment_amount"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "max_allowed_overtime_minutes"`);
    }

}
