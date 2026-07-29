import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785329853596 implements MigrationInterface {
    name = 'Updates1785329853596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" ADD "components_data" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payrolls" DROP COLUMN "components_data"`);
    }

}
