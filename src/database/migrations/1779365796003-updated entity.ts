import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779365796003 implements MigrationInterface {
  name = 'CreateRoleTable1779365796003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "permissions" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "employee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "employee_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "token_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "token_hash" text NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8b76bed7270f26e59ff556171" ON "refresh_tokens"  ("employee_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_b8b76bed7270f26e59ff5561715" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_b8b76bed7270f26e59ff5561715"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8b76bed7270f26e59ff556171"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "token_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "token_hash" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "employee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "employee_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "updated_at"`,
    );
  }
}
