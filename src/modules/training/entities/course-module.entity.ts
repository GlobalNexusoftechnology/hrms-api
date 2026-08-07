import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseTopic } from './course-topic.entity';
import { Assessment } from './assessment.entity';

@Entity('course_modules')
export class CourseModule extends TenantAwareEntity {

  @Column({ name: 'course_id' })
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.modules, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'course_id', referencedColumnName: 'id' },
  ])
  course!: Course;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;

  @OneToMany(() => CourseTopic, (topic) => topic.module)
  topics!: CourseTopic[];

  @OneToOne(() => Assessment, (assessment) => assessment.module)
  assessment!: Assessment;
}
