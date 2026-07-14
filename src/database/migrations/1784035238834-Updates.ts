import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784035238834 implements MigrationInterface {
    name = 'Updates1784035238834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_basic_salary" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_hra" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_allowance" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_pf" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_esic" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_professional_tax" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_professional_tax" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_esic" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_pf" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_allowance" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_hra" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payrolls" ALTER COLUMN "base_basic_salary" DROP NOT NULL`);
    }

}
