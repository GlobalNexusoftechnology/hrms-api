import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784790668413 implements MigrationInterface {
    name = 'Updates1784790668413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employee_addresses_type_enum" AS ENUM('CURRENT', 'PERMANENT', 'OFFICE')`);
        await queryRunner.query(`CREATE TABLE "employee_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "type" "public"."employee_addresses_type_enum" NOT NULL, "address1" text NOT NULL, "address2" text, "city" character varying(100) NOT NULL, "district" character varying(100), "state" character varying(100) NOT NULL, "country" character varying(100) NOT NULL, "postal_code" character varying(20) NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_deb2a222094d803e8d23b13a463" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_emergency_contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "relationship" character varying(100) NOT NULL, "phone" character varying(50) NOT NULL, "alternate_phone" character varying(50), "email" character varying(150), "address" text, "is_primary" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bdc864d96d84ec70e0df9965c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "current_address"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "middle_name" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "display_name" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "personal_email" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "alternate_phone" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."employees_employment_status_enum" AS ENUM('ACTIVE', 'PROBATION', 'NOTICE_PERIOD', 'TERMINATED', 'RESIGNED', 'SUSPENDED', 'DELETED')`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "employment_status" "public"."employees_employment_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`CREATE TYPE "public"."employees_work_location_enum" AS ENUM('REMOTE', 'ON_SITE', 'HYBRID', 'FIELD')`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "work_location" "public"."employees_work_location_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."employees_marital_status_enum" AS ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "marital_status" "public"."employees_marital_status_enum"`);
        await queryRunner.query(`ALTER TABLE "employee_addresses" ADD CONSTRAINT "FK_abf80c712e7c247e7894fc233d8" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_emergency_contacts" ADD CONSTRAINT "FK_71d23315e92a0b0342d4632a29f" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_emergency_contacts" DROP CONSTRAINT "FK_71d23315e92a0b0342d4632a29f"`);
        await queryRunner.query(`ALTER TABLE "employee_addresses" DROP CONSTRAINT "FK_abf80c712e7c247e7894fc233d8"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "marital_status"`);
        await queryRunner.query(`DROP TYPE "public"."employees_marital_status_enum"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "work_location"`);
        await queryRunner.query(`DROP TYPE "public"."employees_work_location_enum"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employment_status"`);
        await queryRunner.query(`DROP TYPE "public"."employees_employment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "alternate_phone"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "personal_email"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "middle_name"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "current_address" text`);
        await queryRunner.query(`DROP TABLE "employee_emergency_contacts"`);
        await queryRunner.query(`DROP TABLE "employee_addresses"`);
        await queryRunner.query(`DROP TYPE "public"."employee_addresses_type_enum"`);
    }

}
