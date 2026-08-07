import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785836912369 implements MigrationInterface {
    name = 'Updates1785836912369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_components" DROP CONSTRAINT "FK_3ff49cccdeec32b9cc3d31e9413"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3ff49cccdeec32b9cc3d31e941"`);
        await queryRunner.query(`ALTER TABLE "salary_components" DROP COLUMN "organization_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_components" ADD "organization_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_3ff49cccdeec32b9cc3d31e941" ON "salary_components" USING btree ("organization_id", "tenant_id") `);
        await queryRunner.query(`ALTER TABLE "salary_components" ADD CONSTRAINT "FK_3ff49cccdeec32b9cc3d31e9413" FOREIGN KEY ("organization_id", "tenant_id") REFERENCES "organizations"("id","tenant_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
