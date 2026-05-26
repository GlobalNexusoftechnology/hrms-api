import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779428744335 implements MigrationInterface {
  name = 'CreateRoleTable1779428744335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employees" ADD "profile_photo" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "profile_photo"`,
    );
  }
}
