import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784558068151 implements MigrationInterface {
    name = 'Updates1784558068151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "task" boolean NOT NULL DEFAULT true, "leave" boolean NOT NULL DEFAULT true, "attendance" boolean NOT NULL DEFAULT true, "payroll" boolean NOT NULL DEFAULT true, "project" boolean NOT NULL DEFAULT true, "team" boolean NOT NULL DEFAULT true, "standup" boolean NOT NULL DEFAULT true, "holiday" boolean NOT NULL DEFAULT true, "training" boolean NOT NULL DEFAULT true, "interview" boolean NOT NULL DEFAULT true, "announcement" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_aab05ba3f20bdb2ff085c8f6e34" UNIQUE ("employee_id"), CONSTRAINT "REL_aab05ba3f20bdb2ff085c8f6e3" UNIQUE ("employee_id"), CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('TASK', 'LEAVE', 'ATTENDANCE', 'PAYROLL', 'PROJECT', 'TEAM', 'STANDUP', 'GENERAL', 'INTERVIEW', 'HOLIDAY', 'TRAINING', 'ANNOUNCEMENT')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'GENERAL', "referenceId" character varying, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "departmentId" uuid, "teamLeadId" uuid, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_48c0c32e6247a2de155baeaf980" UNIQUE ("name"), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teamId" uuid NOT NULL, "employeeId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e1e19fcc17b15861afc609595cb" UNIQUE ("teamId", "employeeId"), CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_aab05ba3f20bdb2ff085c8f6e34" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_d59afae1b9c6b8d9a17548e014f" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_ece1d9122a8f3334815ddba096e" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_a0510025df53d11de586ca13df2" FOREIGN KEY ("teamLeadId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_e3de3324f28dbc6fc320efdeac6" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_e3de3324f28dbc6fc320efdeac6"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_a0510025df53d11de586ca13df2"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_ece1d9122a8f3334815ddba096e"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_d59afae1b9c6b8d9a17548e014f"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_aab05ba3f20bdb2ff085c8f6e34"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "notification_preferences"`);
    }

}
