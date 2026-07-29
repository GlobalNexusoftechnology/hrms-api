import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785324771582 implements MigrationInterface {
    name = 'Updates1785324771582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."salary_components_type_enum" AS ENUM('EARNING', 'DEDUCTION')`);
        await queryRunner.query(`CREATE TYPE "public"."salary_components_calculation_type_enum" AS ENUM('FIXED_AMOUNT', 'PERCENTAGE')`);
        await queryRunner.query(`CREATE TABLE "salary_components" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "type" "public"."salary_components_type_enum" NOT NULL, "calculation_type" "public"."salary_components_calculation_type_enum" NOT NULL, "default_amount" numeric(12,2) NOT NULL DEFAULT '0', "percentage_value" numeric(5,2), "is_mandatory" boolean NOT NULL DEFAULT false, "allow_override" boolean NOT NULL DEFAULT true, "is_taxable" boolean NOT NULL DEFAULT false, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07f83a0db55d0f294bfff38fb74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."salary_structure_components_calculation_type_enum" AS ENUM('FIXED_AMOUNT', 'PERCENTAGE')`);
        await queryRunner.query(`CREATE TABLE "salary_structure_components" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "salary_structure_id" uuid NOT NULL, "salary_component_id" uuid NOT NULL, "component_name" character varying NOT NULL, "calculation_type" "public"."salary_structure_components_calculation_type_enum" NOT NULL, "percentage_value" numeric(5,2), "calculated_amount" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_85e966de274177e2f1984340562" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "allowance"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "net_salary"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "hra"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "professional_tax"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "pf"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "esic"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" DROP COLUMN "bonus"`);
        await queryRunner.query(`ALTER TABLE "salary_components" ADD CONSTRAINT "FK_c1649fc877b4434730a29e4de7e" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "salary_structure_components" ADD CONSTRAINT "FK_0b0bab9ab4ffee34fc343317b44" FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "salary_structure_components" ADD CONSTRAINT "FK_f477b028bdb787d93e7e29b6bbd" FOREIGN KEY ("salary_component_id") REFERENCES "salary_components"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_structure_components" DROP CONSTRAINT "FK_f477b028bdb787d93e7e29b6bbd"`);
        await queryRunner.query(`ALTER TABLE "salary_structure_components" DROP CONSTRAINT "FK_0b0bab9ab4ffee34fc343317b44"`);
        await queryRunner.query(`ALTER TABLE "salary_components" DROP CONSTRAINT "FK_c1649fc877b4434730a29e4de7e"`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "bonus" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "esic" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "pf" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "professional_tax" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "hra" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "net_salary" numeric(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "salary_structures" ADD "allowance" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "salary_structure_components"`);
        await queryRunner.query(`DROP TYPE "public"."salary_structure_components_calculation_type_enum"`);
        await queryRunner.query(`DROP TABLE "salary_components"`);
        await queryRunner.query(`DROP TYPE "public"."salary_components_calculation_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."salary_components_type_enum"`);
    }

}
