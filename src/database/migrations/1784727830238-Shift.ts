import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1784727830238 implements MigrationInterface {
    name = 'Updates1784727830238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "code" character varying(50) NOT NULL, "description" text, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "cross_midnight" boolean NOT NULL DEFAULT false, "standard_working_minutes" integer NOT NULL DEFAULT '480', "break_start_time" TIME, "break_end_time" TIME, "late_grace_minutes" integer NOT NULL DEFAULT '15', "early_leave_grace_minutes" integer NOT NULL DEFAULT '5', "half_day_threshold_minutes" integer NOT NULL DEFAULT '240', "overtime_threshold_minutes" integer NOT NULL DEFAULT '480', "minimum_overtime_minutes" integer NOT NULL DEFAULT '30', "earliest_check_in_minutes" integer NOT NULL DEFAULT '60', "latest_check_in_minutes" integer NOT NULL DEFAULT '240', "is_flexible" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_afa68167f7aeb87bc93ab8d9065" UNIQUE ("code"), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "default_shift_id" uuid`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "shift_id" uuid`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_e0e54592cf2b2fef154dfbaf5b0" FOREIGN KEY ("default_shift_id") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_98e5075745ff16aeca79c12311c" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_98e5075745ff16aeca79c12311c"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_e0e54592cf2b2fef154dfbaf5b0"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "shift_id"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "default_shift_id"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
    }

}
