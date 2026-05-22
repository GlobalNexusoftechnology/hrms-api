import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779281371399 implements MigrationInterface {
  name = 'CreateRoleTable1779281371399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "role_name_enum" AS ENUM (
        'Super Admin',
        'HR',
        'Employee'
      )
    `);

    await queryRunner.query(`CREATE TABLE "roles" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" character varying NOT NULL, 
            "isActive" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP, 


            CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" 
            UNIQUE ("name"), 
            CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(` DROP TYPE "role_name_enum" `);
  }
}
