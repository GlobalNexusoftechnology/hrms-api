import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785579879199 implements MigrationInterface {
    name = 'Updates1785579879199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "branch_id" uuid`);
        await queryRunner.query(`ALTER TABLE "auth_logs" ADD "branch_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_b072a6df2490124a5b48872f0a" ON "activity_logs"  ("branch_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_840f62c0eb8cf11d8523954c14" ON "auth_logs"  ("branch_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_840f62c0eb8cf11d8523954c14"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b072a6df2490124a5b48872f0a"`);
        await queryRunner.query(`ALTER TABLE "auth_logs" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "branch_id"`);
    }

}
