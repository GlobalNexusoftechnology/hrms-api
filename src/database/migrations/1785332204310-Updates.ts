import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785332204310 implements MigrationInterface {
    name = 'Updates1785332204310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_components" ADD "is_proratable" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."salary_components_percentage_base_enum" AS ENUM('BASIC', 'GROSS')`);
        await queryRunner.query(`ALTER TABLE "salary_components" ADD "percentage_base" "public"."salary_components_percentage_base_enum" DEFAULT 'BASIC'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_components" DROP COLUMN "percentage_base"`);
        await queryRunner.query(`DROP TYPE "public"."salary_components_percentage_base_enum"`);
        await queryRunner.query(`ALTER TABLE "salary_components" DROP COLUMN "is_proratable"`);
    }

}
