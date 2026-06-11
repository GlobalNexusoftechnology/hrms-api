import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1781170126396 implements MigrationInterface {
    name = 'Updates1781170126396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "last_login_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "designations" DROP CONSTRAINT "UQ_d1a41bf55e5cc36fb0040d4560a"`);
        await queryRunner.query(`ALTER TABLE "designations" DROP CONSTRAINT "UQ_092119e4b89786770c1ec3b7c02"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "UQ_8681da666ad9699d568b3e91064"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_designation_code_active" ON "designations"  ("code") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_designation_name_active" ON "designations"  ("name") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_department_code_active" ON "departments"  ("code") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_department_name_active" ON "departments"  ("name") WHERE "deleted_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."unique_department_name_active"`);
        await queryRunner.query(`DROP INDEX "public"."unique_department_code_active"`);
        await queryRunner.query(`DROP INDEX "public"."unique_designation_name_active"`);
        await queryRunner.query(`DROP INDEX "public"."unique_designation_code_active"`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "designations" ADD CONSTRAINT "UQ_092119e4b89786770c1ec3b7c02" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "designations" ADD CONSTRAINT "UQ_d1a41bf55e5cc36fb0040d4560a" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "last_login_at"`);
    }

}
