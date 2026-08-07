import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CourseModule } from './course-module.entity';
import { CourseMaterial } from './course-material.entity';

@Entity('course_topics')
export class CourseTopic extends TenantAwareEntity {

  @Column({ name: 'module_id' })
  moduleId!: string;

  @ManyToOne(() => CourseModule, (mod) => mod.topics, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'module_id', referencedColumnName: 'id' },
  ])
  module!: CourseModule;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;

  @OneToMany(() => CourseMaterial, (material) => material.topic)
  materials!: CourseMaterial[];
}
