import { MigrationInterface, QueryRunner } from "typeorm";

export class PayrollBaseBonus1785248604713 implements MigrationInterface {
    name = 'PayrollBaseBonus1785248604713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_bonus" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_bonus"`);
    }

}
