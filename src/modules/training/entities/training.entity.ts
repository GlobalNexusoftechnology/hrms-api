import { TrainingTypeEnum } from '../../../common/enums/training-type.enum';
import { Department } from '../../departments/entities/department.entity';
import { Employee } from '../../employees/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TrainingAssignment } from './training-assignment.entity';
import { TrainingMaterial } from './training-material.entity';

@Entity('trainings')
export class Training {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: TrainingTypeEnum,
  })
  type!: TrainingTypeEnum;

  @Column({
    nullable: true,
    name: 'department_id',
  })
  departmentId!: string | null;
  @ManyToOne(() => Department, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'department_id',
  })
  department!: Department | null;

  @Column({
    name: 'created_by',
  })
  createdBy!: string;

  @ManyToOne(() => Employee, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by',
  })
  creator!: Employee;

  @Column({
    nullable: true,
    name: 'start_date',
    type: 'timestamp',
  })
  startDate!: Date | null;

  @Column({
    type: 'timestamp',
    name: 'end_date',
    nullable: true,
  })
  endDate!: Date | null;

  @OneToMany(() => TrainingMaterial, (material) => material.training)
  materials!: TrainingMaterial[];

  @OneToMany(() => TrainingAssignment, (assignment) => assignment.training)
  assignments!: TrainingAssignment[];

  @Column({
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
  updateAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt!: Date | null;
}
