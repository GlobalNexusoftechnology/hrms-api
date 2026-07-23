import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784809075068 implements MigrationInterface {
    name = 'Updates1784809075068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_career_movements" DROP COLUMN "old_manager_id"`);
        await queryRunner.query(`ALTER TABLE "employee_career_movements" DROP COLUMN "new_manager_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_career_movements" ADD "new_manager_id" uuid`);
        await queryRunner.query(`ALTER TABLE "employee_career_movements" ADD "old_manager_id" uuid`);
    }

}
