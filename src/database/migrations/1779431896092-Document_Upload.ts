import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleTable1779431896092 implements MigrationInterface {
    name = 'CreateRoleTable1779431896092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employee_documents_document_type_enum" AS ENUM('AADHAAR', 'PAN', 'RESUME', 'OFFER_LETTER', 'DEGREE', 'EXPERIENCE_LETTER', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "employee_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "document_type" "public"."employee_documents_document_type_enum" NOT NULL, "file_name" character varying NOT NULL, "file_url" text NOT NULL, "mime_type" character varying NOT NULL, "file_size" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_c19b36f5e604e261fb430293b68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_documents" ADD CONSTRAINT "FK_7fce49bcbfe15a73953b2809944" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_documents" DROP CONSTRAINT "FK_7fce49bcbfe15a73953b2809944"`);
        await queryRunner.query(`DROP TABLE "employee_documents"`);
        await queryRunner.query(`DROP TYPE "public"."employee_documents_document_type_enum"`);
    }

}
