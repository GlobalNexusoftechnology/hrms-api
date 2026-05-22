import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779480751244 implements MigrationInterface {
  name = 'CreateRoleTable1779480751244';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==========================
    // RENAME OLD ENUM
    // ==========================

    await queryRunner.query(`
      ALTER TYPE "public"."attendances_status_enum"
      RENAME TO "attendances_status_enum_old"
    `);

    // ==========================
    // CREATE NEW ENUM
    // ==========================

    await queryRunner.query(`
      CREATE TYPE "public"."attendances_status_enum"
      AS ENUM(
        'PRESENT',
        'LATE',
        'HALF_DAY',
        'LEAVE',
        'ABSENT',
        'HOLIDAY',
        'WEEKEND'
      )
    `);

    // ==========================
    // REMOVE DEFAULT
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      DROP DEFAULT
    `);

    // ==========================
    // CONVERT OLD VALUES
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      TYPE text
      USING status::text
    `);

    await queryRunner.query(`
      UPDATE "attendances"
      SET "status" = CASE
        WHEN "status" = 'present'
          THEN 'PRESENT'

        WHEN "status" = 'late'
          THEN 'LATE'

        WHEN "status" = 'halfDay'
          THEN 'HALF_DAY'

        WHEN "status" = 'leave'
          THEN 'LEAVE'

        WHEN "status" = 'absent'
          THEN 'ABSENT'

        WHEN "status" = 'wfh'
          THEN 'PRESENT'

        ELSE UPPER("status")
      END
    `);

    // ==========================
    // APPLY NEW ENUM
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      TYPE "public"."attendances_status_enum"
      USING "status"::"public"."attendances_status_enum"
    `);

    // ==========================
    // DEFAULT VALUE
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      SET DEFAULT 'PRESENT'
    `);

    // ==========================
    // DROP OLD ENUM
    // ==========================

    await queryRunner.query(`
      DROP TYPE "public"."attendances_status_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ==========================
    // CREATE OLD ENUM
    // ==========================

    await queryRunner.query(`
      CREATE TYPE "public"."attendances_status_enum_old"
      AS ENUM(
        'present',
        'absent',
        'late',
        'halfDay',
        'leave',
        'wfh'
      )
    `);

    // ==========================
    // REMOVE DEFAULT
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      DROP DEFAULT
    `);

    // ==========================
    // CONVERT TO TEXT
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      TYPE text
      USING status::text
    `);

    // ==========================
    // MAP BACK TO OLD VALUES
    // ==========================

    await queryRunner.query(`
      UPDATE "attendances"
      SET "status" = CASE
        WHEN "status" = 'PRESENT'
          THEN 'present'

        WHEN "status" = 'LATE'
          THEN 'late'

        WHEN "status" = 'HALF_DAY'
          THEN 'halfDay'

        WHEN "status" = 'LEAVE'
          THEN 'leave'

        WHEN "status" = 'ABSENT'
          THEN 'absent'

        WHEN "status" = 'HOLIDAY'
          THEN 'present'

        WHEN "status" = 'WEEKEND'
          THEN 'present'

        ELSE LOWER("status")
      END
    `);

    // ==========================
    // APPLY OLD ENUM
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      TYPE "public"."attendances_status_enum_old"
      USING "status"::"public"."attendances_status_enum_old"
    `);

    // ==========================
    // DEFAULT VALUE
    // ==========================

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "status"
      SET DEFAULT 'present'
    `);

    // ==========================
    // DROP NEW ENUM
    // ==========================

    await queryRunner.query(`
      DROP TYPE "public"."attendances_status_enum"
    `);

    // ==========================
    // RENAME OLD BACK
    // ==========================

    await queryRunner.query(`
      ALTER TYPE "public"."attendances_status_enum_old"
      RENAME TO "attendances_status_enum"
    `);
  }
}
