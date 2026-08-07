import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784809925519 implements MigrationInterface {
    name = 'Updates1784809925519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "status_code" integer`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "response_time" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "response_time"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "status_code"`);
    }

}
