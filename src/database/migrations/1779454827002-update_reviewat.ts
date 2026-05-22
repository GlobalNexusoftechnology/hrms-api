import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleTable1779454827002 implements MigrationInterface {
    name = 'CreateRoleTable1779454827002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_corrections" ADD "reviewed_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_corrections" DROP COLUMN "reviewed_at"`);
    }

}
