import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleTable1779382872970 implements MigrationInterface {
    name = 'CreateRoleTable1779382872970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "designations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "department_id" uuid NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d1a41bf55e5cc36fb0040d4560a" UNIQUE ("name"), CONSTRAINT "UQ_092119e4b89786770c1ec3b7c02" UNIQUE ("code"), CONSTRAINT "PK_a0f024b99b1491a03fc421858ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "designation_id" uuid`);
        await queryRunner.query(`ALTER TABLE "designations" ADD CONSTRAINT "FK_97884615dba807341722aa7aa4b" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_2de5d6e4fb3345f18bc467017f0" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_2de5d6e4fb3345f18bc467017f0"`);
        await queryRunner.query(`ALTER TABLE "designations" DROP CONSTRAINT "FK_97884615dba807341722aa7aa4b"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "designation_id"`);
        await queryRunner.query(`DROP TABLE "designations"`);
    }

}
