import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { Branch } from '../../organization/entities/branch.entity';
import { Department } from '../../departments/entities/department.entity';
import { Designation } from '../../designations/entities/designation.entity';
import { Role } from '../../roles/entities/role.entity';
import { Shift } from '../../shift/entities/shift.entity';
import { SalaryStructure } from '../../salary-structure/entities/salary-structure.entity';

import { CareerMovementTypeEnum } from '../../../common/enums/career-movement-type.enum';
import { CareerMovementStatusEnum } from '../../../common/enums/career-movement-status.enum';

@Entity('employee_career_movements')
export class EmployeeCareerMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.careerMovements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'enum', enum: CareerMovementTypeEnum, name: 'movement_type' })
  movementType!: CareerMovementTypeEnum;

  @Column({ type: 'enum', enum: CareerMovementStatusEnum, default: CareerMovementStatusEnum.PENDING })
  status!: CareerMovementStatusEnum;

  @Column({ type: 'date', name: 'effective_date' })
  effectiveDate!: Date;

  // OLD VALUES
  @Column({ name: 'old_branch_id', type: 'uuid', nullable: true })
  oldBranchId!: string | null;

  @Column({ name: 'old_department_id', type: 'uuid', nullable: true })
  oldDepartmentId!: string | null;

  @Column({ name: 'old_designation_id', type: 'uuid', nullable: true })
  oldDesignationId!: string | null;

  @Column({ name: 'old_role_id', type: 'uuid', nullable: true })
  oldRoleId!: string | null;

  @Column({ name: 'old_shift_id', type: 'uuid', nullable: true })
  oldShiftId!: string | null;

  @Column({ name: 'old_salary_structure_id', type: 'uuid', nullable: true })
  oldSalaryStructureId!: string | null;

  // NEW VALUES
  @Column({ name: 'new_branch_id', type: 'uuid', nullable: true })
  newBranchId!: string | null;

  @Column({ name: 'new_department_id', type: 'uuid', nullable: true })
  newDepartmentId!: string | null;

  @Column({ name: 'new_designation_id', type: 'uuid', nullable: true })
  newDesignationId!: string | null;

  @Column({ name: 'new_role_id', type: 'uuid', nullable: true })
  newRoleId!: string | null;

  @Column({ name: 'new_shift_id', type: 'uuid', nullable: true })
  newShiftId!: string | null;

  @Column({ name: 'new_salary_structure_id', type: 'uuid', nullable: true })
  newSalaryStructureId!: string | null;

  // METADATA
  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'text', nullable: true })
  remarks!: string | null;

  @Column({ name: 'reference_number', type: 'varchar', length: 150, nullable: true })
  referenceNumber!: string | null;

  @Column({ name: 'attachment_document_id', type: 'uuid', nullable: true })
  attachmentDocumentId!: string | null;

  @Column({ name: 'impact_payroll', type: 'boolean', default: false })
  impactPayroll!: boolean;

  @Column({ name: 'impact_permissions', type: 'boolean', default: false })
  impactPermissions!: boolean;

  // AUDIT LOGS
  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy!: string | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'executed_by', type: 'uuid', nullable: true })
  executedBy!: string | null;

  @Column({ name: 'requested_at', type: 'timestamp', nullable: true })
  requestedAt!: Date | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
