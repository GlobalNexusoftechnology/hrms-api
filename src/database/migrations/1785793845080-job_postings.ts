import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785793845080 implements MigrationInterface {
    name = 'Updates1785793845080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_postings" ADD "last_date_to_apply" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_postings" DROP COLUMN "last_date_to_apply"`);
    }

}
