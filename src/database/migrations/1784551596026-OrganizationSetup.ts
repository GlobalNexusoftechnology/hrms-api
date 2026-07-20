import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationSetup1784551596026 implements MigrationInterface {
    name = 'OrganizationSetup1784551596026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organization_addresses_address_type_enum" AS ENUM('REGISTERED', 'BILLING', 'CORPORATE')`);
        await queryRunner.query(`CREATE TABLE "organization_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "address_type" "public"."organization_addresses_address_type_enum" NOT NULL DEFAULT 'REGISTERED', "line1" character varying NOT NULL, "line2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "country" character varying NOT NULL, "zip" character varying NOT NULL, "latitude" double precision, "longitude" double precision, CONSTRAINT "PK_cb9df8649d3c06d470b5d1b9031" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_af4948af16ab7c4c9c6c211bd3" ON "organization_addresses"  ("organization_id", "address_type") `);
        await queryRunner.query(`CREATE TABLE "organization_taxes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "pan" character varying NOT NULL, "gst" character varying, "tan" character varying, "cin" character varying, "msme" character varying, CONSTRAINT "REL_29bab951d5b4d6ed9302e1719b" UNIQUE ("organization_id"), CONSTRAINT "PK_d1997b36a7f3726569fd298994e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_settings_week_start_day_enum" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')`);
        await queryRunner.query(`CREATE TABLE "organization_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "timezone" character varying NOT NULL, "currency" character varying NOT NULL, "language" character varying NOT NULL, "date_format" character varying NOT NULL, "time_format" character varying NOT NULL, "week_start_day" "public"."organization_settings_week_start_day_enum" NOT NULL DEFAULT 'MONDAY', "financial_year_start_month" integer NOT NULL, CONSTRAINT "REL_5fbdacce9bdcb454877d068e35" UNIQUE ("organization_id"), CONSTRAINT "CHK_726a4afe0b1bff9a7b0a74aaa5" CHECK ("financial_year_start_month" BETWEEN 1 AND 12), CONSTRAINT "PK_67a83a1c6256f927137c33ddd7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_contacts_contact_type_enum" AS ENUM('PRIMARY', 'BILLING', 'LEGAL', 'HR', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "organization_contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "branch_id" uuid, "contact_type" "public"."organization_contacts_contact_type_enum" NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "designation" character varying, CONSTRAINT "PK_3728fac56883cb199cd707037a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_59580ba4b6cf1bcab8ebc6b7aa" ON "organization_contacts"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2bf58135c74277f58e0fe54cc7" ON "organization_contacts"  ("branch_id") `);
        await queryRunner.query(`CREATE TABLE "organization_bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "branch_id" uuid, "bank_name" character varying NOT NULL, "account_name" character varying NOT NULL, "account_number" character varying NOT NULL, "ifsc_code" character varying NOT NULL, "branch_name" character varying, "is_primary" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_761fe8998bca587ece820322550" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3cb326fbeee066d6aa510d6f79" ON "organization_bank_accounts"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_466917ceb48d0045976568ea4c" ON "organization_bank_accounts"  ("branch_id") `);
        await queryRunner.query(`CREATE TYPE "public"."organization_documents_document_type_enum" AS ENUM('INCORPORATION', 'TAX', 'LICENSE', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "organization_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "branch_id" uuid, "document_type" "public"."organization_documents_document_type_enum" NOT NULL, "title" character varying NOT NULL, "file_url" character varying NOT NULL, "expiry_date" date, CONSTRAINT "PK_7455629b99d63c33c64386a870d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3a028be3e263bf8bf5dc2e4675" ON "organization_documents"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_69a53c0e31e2813301540c10d3" ON "organization_documents"  ("branch_id") `);
        await queryRunner.query(`CREATE TYPE "public"."organizations_status_enum" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_code" character varying NOT NULL, "name" character varying NOT NULL, "legal_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "website" character varying, "logo_url" character varying, "status" "public"."organizations_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2186c796706a516d7a63ea2791" ON "organizations"  ("organization_code") `);
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_user_id" uuid, "updated_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" uuid NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "is_head_office" boolean NOT NULL DEFAULT false, "line1" character varying NOT NULL, "line2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "country" character varying NOT NULL, "zip" character varying NOT NULL, "timezone" character varying, "is_active" boolean NOT NULL DEFAULT true, "manager_id" uuid, CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE ("code"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9ecf73d5ca57108dc33c87f7d8" ON "branches"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_14da1875eaf9e5c81ca4678765" ON "branches"  ("manager_id") `);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."is_protected" IS 'Protected roles cannot be deleted, renamed, deactivated, or have permissions removed'`);
        await queryRunner.query(`ALTER TABLE "organization_addresses" ADD CONSTRAINT "FK_0ad7ae19234b12ccc19f5ed6418" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_taxes" ADD CONSTRAINT "FK_29bab951d5b4d6ed9302e1719b7" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_settings" ADD CONSTRAINT "FK_5fbdacce9bdcb454877d068e355" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" ADD CONSTRAINT "FK_59580ba4b6cf1bcab8ebc6b7aa3" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" ADD CONSTRAINT "FK_2bf58135c74277f58e0fe54cc77" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" ADD CONSTRAINT "FK_3cb326fbeee066d6aa510d6f792" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" ADD CONSTRAINT "FK_466917ceb48d0045976568ea4cb" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_documents" ADD CONSTRAINT "FK_3a028be3e263bf8bf5dc2e46759" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_documents" ADD CONSTRAINT "FK_69a53c0e31e2813301540c10d34" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_9ecf73d5ca57108dc33c87f7d88" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_14da1875eaf9e5c81ca4678765d" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_14da1875eaf9e5c81ca4678765d"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_9ecf73d5ca57108dc33c87f7d88"`);
        await queryRunner.query(`ALTER TABLE "organization_documents" DROP CONSTRAINT "FK_69a53c0e31e2813301540c10d34"`);
        await queryRunner.query(`ALTER TABLE "organization_documents" DROP CONSTRAINT "FK_3a028be3e263bf8bf5dc2e46759"`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" DROP CONSTRAINT "FK_466917ceb48d0045976568ea4cb"`);
        await queryRunner.query(`ALTER TABLE "organization_bank_accounts" DROP CONSTRAINT "FK_3cb326fbeee066d6aa510d6f792"`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" DROP CONSTRAINT "FK_2bf58135c74277f58e0fe54cc77"`);
        await queryRunner.query(`ALTER TABLE "organization_contacts" DROP CONSTRAINT "FK_59580ba4b6cf1bcab8ebc6b7aa3"`);
        await queryRunner.query(`ALTER TABLE "organization_settings" DROP CONSTRAINT "FK_5fbdacce9bdcb454877d068e355"`);
        await queryRunner.query(`ALTER TABLE "organization_taxes" DROP CONSTRAINT "FK_29bab951d5b4d6ed9302e1719b7"`);
        await queryRunner.query(`ALTER TABLE "organization_addresses" DROP CONSTRAINT "FK_0ad7ae19234b12ccc19f5ed6418"`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."is_protected" IS NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14da1875eaf9e5c81ca4678765"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ecf73d5ca57108dc33c87f7d8"`);
        await queryRunner.query(`DROP TABLE "branches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2186c796706a516d7a63ea2791"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TYPE "public"."organizations_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69a53c0e31e2813301540c10d3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a028be3e263bf8bf5dc2e4675"`);
        await queryRunner.query(`DROP TABLE "organization_documents"`);
        await queryRunner.query(`DROP TYPE "public"."organization_documents_document_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_466917ceb48d0045976568ea4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3cb326fbeee066d6aa510d6f79"`);
        await queryRunner.query(`DROP TABLE "organization_bank_accounts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2bf58135c74277f58e0fe54cc7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_59580ba4b6cf1bcab8ebc6b7aa"`);
        await queryRunner.query(`DROP TABLE "organization_contacts"`);
        await queryRunner.query(`DROP TYPE "public"."organization_contacts_contact_type_enum"`);
        await queryRunner.query(`DROP TABLE "organization_settings"`);
        await queryRunner.query(`DROP TYPE "public"."organization_settings_week_start_day_enum"`);
        await queryRunner.query(`DROP TABLE "organization_taxes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af4948af16ab7c4c9c6c211bd3"`);
        await queryRunner.query(`DROP TABLE "organization_addresses"`);
        await queryRunner.query(`DROP TYPE "public"."organization_addresses_address_type_enum"`);
    }

}
