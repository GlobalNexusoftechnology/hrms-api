import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1783590582550 implements MigrationInterface {
    name = 'Updates1783590582550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_basic_salary" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_hra" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_allowance" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_pf" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_esic" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "base_professional_tax" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_professional_tax"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_esic"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_pf"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_allowance"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_hra"`);
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "base_basic_salary"`);
    }

}
