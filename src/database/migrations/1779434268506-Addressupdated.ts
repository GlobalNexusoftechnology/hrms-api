import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleTable1779434268506 implements MigrationInterface {
    name = 'CreateRoleTable1779434268506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "current_address" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "current_address"`);
    }

}
