import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784727917000 implements MigrationInterface {
    name = 'Updates1784727917000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" ADD "default_shift_id" uuid`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_b53fc9ae069ca93e6c0e717c2f5" FOREIGN KEY ("default_shift_id") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_b53fc9ae069ca93e6c0e717c2f5"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "default_shift_id"`);
    }

}
