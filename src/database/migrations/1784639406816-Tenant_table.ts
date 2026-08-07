import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784639406816 implements MigrationInterface {
    name = 'Updates1784639406816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tenants_status_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "code" character varying NOT NULL, "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'ACTIVE', "description" text, CONSTRAINT "UQ_3021c18db2b363ae9324c826c5a" UNIQUE ("code"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3021c18db2b363ae9324c826c5" ON "tenants"  ("code") `);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "tenant_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_73cf5671daf6562fae8c1a2df9" ON "organizations"  ("tenant_id") `);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_73cf5671daf6562fae8c1a2df99" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_73cf5671daf6562fae8c1a2df99"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_73cf5671daf6562fae8c1a2df9"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "tenant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3021c18db2b363ae9324c826c5"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`);
    }

}
