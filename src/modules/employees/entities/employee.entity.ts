import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Role } from '../../roles/entities/role.entity';
import { Designation } from '../../designations/entities/designation.entity';
import { EmploymentTypeEnum } from '../../../common/enums/employment-type.enum';
import { GenderEnum } from '../../../common/enums/gender.enum';
import { EmployeeDocument } from '../../employee-documents/entities/employee-document.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { AttendanceCorrection } from '../../attendance/entities/correction.entity';
import { SalaryStructure } from '../../salary-structure/entities/salary-structure.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    name: 'employee_code',
  })
  employeeCode!: string;

  @Column({
    name: 'first_name',
  })
  firstName!: string;

  @Column({
    name: 'last_name',
  })
  lastName!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    unique: true,
  })
  mobile!: string;

  @Column({
    select: false,
  })
  password!: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'current_address',
  })
  currentAddress: string | null = null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'profile_photo',
  })
  profilePhoto: string | null = null;

  @OneToMany(() => EmployeeDocument, (document) => document.employee)
  documents!: EmployeeDocument[];

  @Column({
    name: 'role_id',
  })
  roleId!: string;

  @ManyToOne(() => Role, {
    nullable: false,
  })
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;

  @Column({
    name: 'department_id',
    nullable: true,
  })
  departmentId!: string | null;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({
    name: 'department_id',
  })
  department!: Department;

  @OneToMany(
    () => SalaryStructure,
    (salaryStructure) => salaryStructure.employee,
  )
  salaryStructures!: SalaryStructure[];

  @Column({
    name: 'designation_id',
    nullable: true,
  })
  designationId!: string | null;

  @ManyToOne(() => Designation, (designation) => designation.employees)
  @JoinColumn({
    name: 'designation_id',
  })
  designation!: Designation;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances!: Attendance[];

  @OneToMany(() => AttendanceCorrection, (correction) => correction.employee)
  attendanceCorrections!: AttendanceCorrection[];

  @Column({
    type: 'date',
    name: 'joining_date',
    nullable: true,
  })
  joiningDate!: Date | null;

  @Column({
    type: 'enum',
    enum: EmploymentTypeEnum,

    name: 'employment_type',

    nullable: true,
  })
  employmentType!: EmploymentTypeEnum | null;

  @Column({
    type: 'enum',
    enum: GenderEnum,

    nullable: true,
  })
  gender!: GenderEnum | null;

  @Column({
    type: 'date',
    name: 'date_of_birth',

    nullable: true,
  })
  dateOfBirth!: Date | null;

  @Column({
    default: 1,

    name: 'password_version',
  })
  passwordVersion!: number;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_login_at',
  })
  lastLoginAt!: Date | null;
}
