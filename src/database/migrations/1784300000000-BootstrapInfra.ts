import { MigrationInterface, QueryRunner } from 'typeorm';

export class BootstrapInfra1784300000000 implements MigrationInterface {
  name = 'BootstrapInfra1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create generic system_config table
    await queryRunner.query(`
      CREATE TABLE "system_config" (
        "key"         VARCHAR(100) NOT NULL,
        "value"       TEXT         NOT NULL,
        "description" TEXT,
        "created_at"  TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_config" PRIMARY KEY ("key")
      )
    `);

    // 2. Add is_protected column to roles table
    await queryRunner.query(`
      ALTER TABLE "roles"
      ADD COLUMN "is_protected" BOOLEAN NOT NULL DEFAULT FALSE
    `);

    // 3. Mark any existing SUPER_ADMIN role as protected (safe no-op if doesn't exist yet)
    await queryRunner.query(`
      UPDATE "roles" SET "is_protected" = TRUE WHERE "name" = 'SUPER_ADMIN'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "is_protected"`);
    await queryRunner.query(`DROP TABLE "system_config"`);
  }
}
