import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1779288903609 implements MigrationInterface {
  name = 'CreateRoleTable1779288903609';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "employees" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "employee_code" character varying NOT NULL, 
            "first_name" character varying NOT NULL, 
            "last_name" character varying NOT NULL, 
            "email" character varying NOT NULL, 
            "mobile" character varying NOT NULL, 
            "password" character varying NOT NULL, 
            "role_id" uuid NOT NULL, 
            "is_active" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "deleted_at" TIMESTAMP, 
            
            CONSTRAINT "UQ_56162b5f24af743a154680684f5" UNIQUE ("employee_code"), 
            CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), 
            CONSTRAINT "UQ_a71bb5a4ec335c7592d1e7fc107" UNIQUE ("mobile"), 
            CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_727d9c30d77d3a253177b2e918f" 
            FOREIGN KEY ("role_id") REFERENCES "roles"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_727d9c30d77d3a253177b2e918f"`,
    );
    await queryRunner.query(`DROP TABLE "employees"`);
  }
}
