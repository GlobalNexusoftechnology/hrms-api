import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ResignationStatusEnum } from '../../../common/enums/resignation-status.enum';

@Entity('resignations')
@Index(['tenantId', 'employeeId'])
export class Resignation extends TenantAwareEntity {

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ name: 'resignation_date', type: 'date' })
  resignationDate!: Date;

  @Column({ name: 'requested_last_working_date', type: 'date' })
  requestedLastWorkingDate!: Date;

  @Column({ name: 'approved_last_working_date', type: 'date', nullable: true })
  approvedLastWorkingDate!: Date | null;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  remarks!: string | null;

  @Column({ name: 'is_shortfall', type: 'boolean', default: false })
  isShortfall!: boolean;

  @Column({ name: 'shortfall_reason', type: 'text', nullable: true })
  shortfallReason!: string | null;

  @Column({
    type: 'enum',
    enum: ResignationStatusEnum,
    default: ResignationStatusEnum.PENDING,
  })
  status!: ResignationStatusEnum;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'executed_by', type: 'uuid', nullable: true })
  executedBy!: string | null;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt!: Date | null;

}
