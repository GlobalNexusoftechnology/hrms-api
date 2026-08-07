import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784721708460 implements MigrationInterface {
    name = 'Updates1784721708460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d953f74b03a714f336578a88b2"`);
        await queryRunner.query(`ALTER TABLE "leaves" RENAME COLUMN "type" TO "leave_type_id"`);
        await queryRunner.query(`ALTER TYPE "public"."leaves_type_enum" RENAME TO "leaves_leave_type_id_enum"`);
        await queryRunner.query(`CREATE TABLE "leave_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e41bb9537ef5e65ee2de2cfa81a" UNIQUE ("name"), CONSTRAINT "UQ_600530eb1d9f853dd746e5819c4" UNIQUE ("code"), CONSTRAINT "PK_359223e0755d19711813cd07394" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."leave_ledger_transaction_type_enum" AS ENUM('ACCRUAL', 'LEAVE_TAKEN', 'ADJUSTMENT', 'CARRY_FORWARD', 'ENCASHMENT')`);
        await queryRunner.query(`CREATE TABLE "leave_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "leave_type_id" uuid NOT NULL, "transaction_type" "public"."leave_ledger_transaction_type_enum" NOT NULL, "days" numeric(5,2) NOT NULL, "reference_id" character varying, "remarks" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b61ad3a69da6935b15e53980c91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0dd476c158a753e71eabcad6d6" ON "leave_ledger"  ("employee_id", "leave_type_id") `);
        await queryRunner.query(`CREATE TYPE "public"."leave_policies_scopetype_enum" AS ENUM('ORGANIZATION', 'BRANCH', 'DEPARTMENT', 'TEAM')`);
        await queryRunner.query(`CREATE TYPE "public"."leave_policies_accrual_frequency_enum" AS ENUM('MONTHLY', 'YEARLY', 'UPFRONT', 'NONE')`);
        await queryRunner.query(`CREATE TYPE "public"."leave_policies_gender_enum" AS ENUM('ALL', 'MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TABLE "leave_policies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leave_type_id" uuid NOT NULL, "scopeType" "public"."leave_policies_scopetype_enum" NOT NULL DEFAULT 'ORGANIZATION', "scope_id" character varying, "effective_from" date, "effective_to" date, "is_paid" boolean NOT NULL DEFAULT true, "annual_quota" numeric(5,2) NOT NULL, "accrual_rate" numeric(5,2) NOT NULL DEFAULT '0', "accrual_frequency" "public"."leave_policies_accrual_frequency_enum" NOT NULL DEFAULT 'YEARLY', "carry_forward" boolean NOT NULL DEFAULT false, "max_carry_forward" numeric(5,2) NOT NULL DEFAULT '0', "carry_forward_expiry_months" integer, "gender" "public"."leave_policies_gender_enum" NOT NULL DEFAULT 'ALL', "minimum_service_days" integer NOT NULL DEFAULT '0', "notice_days" integer NOT NULL DEFAULT '0', "document_required_after_days" integer, "allow_half_day" boolean NOT NULL DEFAULT false, "requires_approval" boolean NOT NULL DEFAULT true, "allow_negative_balance" boolean NOT NULL DEFAULT false, "max_negative_balance" numeric(5,2) NOT NULL DEFAULT '0', "encashable" boolean NOT NULL DEFAULT false, "count_weekend" boolean NOT NULL DEFAULT true, "count_holiday" boolean NOT NULL DEFAULT true, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d3b46bd2974cbb56e3831f3f34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "month"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "monthly_credit"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "carry_forward"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "used_leaves"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "remaining_leaves"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "paid_leaves_used"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "unpaid_leaves_used"`);
        await queryRunner.query(`ALTER TABLE "departments" ADD "branch_id" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."roles_data_scope_enum" AS ENUM('ORGANIZATION', 'BRANCH', 'DEPARTMENT', 'TEAM', 'SELF')`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "data_scope" "public"."roles_data_scope_enum" NOT NULL DEFAULT 'SELF'`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."data_scope" IS 'Phase 1 implementation. Planned to migrate to EmployeeRole assignment table in Phase 2.'`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "branch_id" uuid`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "leave_type_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "accrued" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "used" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "carried_forward" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leaves" DROP COLUMN "leave_type_id"`);
        await queryRunner.query(`ALTER TABLE "leaves" ADD "leave_type_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe31f79885435948a4f45d2c9b" ON "leave_balances"  ("employee_id", "leave_type_id", "year") `);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_40b8818a0e3324c859199265503" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_457a39c666de2686596e502eb8c" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaves" ADD CONSTRAINT "FK_f434fa2bee32673ad01d59ea810" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_d64da0a991d2f4d23d86031530c" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_ledger" ADD CONSTRAINT "FK_069494b55b17c142b13733925e7" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_ledger" ADD CONSTRAINT "FK_b69d66a659210b956f8045bb1ad" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_policies" ADD CONSTRAINT "FK_145159e6d88d26843a8f9a0928b" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_policies" DROP CONSTRAINT "FK_145159e6d88d26843a8f9a0928b"`);
        await queryRunner.query(`ALTER TABLE "leave_ledger" DROP CONSTRAINT "FK_b69d66a659210b956f8045bb1ad"`);
        await queryRunner.query(`ALTER TABLE "leave_ledger" DROP CONSTRAINT "FK_069494b55b17c142b13733925e7"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_d64da0a991d2f4d23d86031530c"`);
        await queryRunner.query(`ALTER TABLE "leaves" DROP CONSTRAINT "FK_f434fa2bee32673ad01d59ea810"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_457a39c666de2686596e502eb8c"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_40b8818a0e3324c859199265503"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe31f79885435948a4f45d2c9b"`);
        await queryRunner.query(`ALTER TABLE "leaves" DROP COLUMN "leave_type_id"`);
        await queryRunner.query(`ALTER TABLE "leaves" ADD "leave_type_id" "public"."leaves_leave_type_id_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "carried_forward"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "used"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "accrued"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" DROP COLUMN "leave_type_id"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "branch_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."data_scope" IS 'Phase 1 implementation. Planned to migrate to EmployeeRole assignment table in Phase 2.'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "data_scope"`);
        await queryRunner.query(`DROP TYPE "public"."roles_data_scope_enum"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "unpaid_leaves_used" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "paid_leaves_used" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "remaining_leaves" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "used_leaves" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "carry_forward" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "monthly_credit" integer NOT NULL DEFAULT '2'`);
        await queryRunner.query(`ALTER TABLE "leave_balances" ADD "month" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "leave_policies"`);
        await queryRunner.query(`DROP TYPE "public"."leave_policies_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."leave_policies_accrual_frequency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."leave_policies_scopetype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dd476c158a753e71eabcad6d6"`);
        await queryRunner.query(`DROP TABLE "leave_ledger"`);
        await queryRunner.query(`DROP TYPE "public"."leave_ledger_transaction_type_enum"`);
        await queryRunner.query(`DROP TABLE "leave_types"`);
        await queryRunner.query(`ALTER TYPE "public"."leaves_leave_type_id_enum" RENAME TO "leaves_type_enum"`);
        await queryRunner.query(`ALTER TABLE "leaves" RENAME COLUMN "leave_type_id" TO "type"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d953f74b03a714f336578a88b2" ON "leave_balances" USING btree ("employee_id", "month", "year") `);
    }

}
