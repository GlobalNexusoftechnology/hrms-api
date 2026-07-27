import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1785085540044 implements MigrationInterface {
    name = 'Updates1785085540044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" ADD "branchId" uuid`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "organizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_470c8b77ec69173088ecc2de2b0" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_858389ddeb0bd6c6bf4e323f91e" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_858389ddeb0bd6c6bf4e323f91e"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_470c8b77ec69173088ecc2de2b0"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "branchId"`);
    }

}
