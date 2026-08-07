import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785326203208 implements MigrationInterface {
    name = 'Updates1785326203208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "effective_to" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "effective_to"`);
    }

}
