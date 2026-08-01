import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CourseModule } from './course-module.entity';
import { AssessmentQuestion } from './assessment-question.entity';

@Entity('assessments')
export class Assessment extends TenantAwareEntity {

  @Column({ name: 'module_id' })
  moduleId!: string;

  @OneToOne(() => CourseModule, (mod) => mod.assessment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'module_id', referencedColumnName: 'id' },
  ])
  module!: CourseModule;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', name: 'passing_percentage', default: 40 })
  passingPercentage!: number;

  @OneToMany(() => AssessmentQuestion, (q) => q.assessment)
  questions!: AssessmentQuestion[];
}
