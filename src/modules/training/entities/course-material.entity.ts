import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CourseTopic } from './course-topic.entity';
import { TrainingMaterialTypeEnum } from '../../../common/enums/training-material-type.enum';

@Entity('course_materials')
export class CourseMaterial extends TenantAwareEntity {

  @Column({ name: 'topic_id' })
  topicId!: string;

  @ManyToOne(() => CourseTopic, (topic) => topic.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'topic_id', referencedColumnName: 'id' },
  ])
  topic!: CourseTopic;

  @Column()
  title!: string;

  @Column({ type: 'enum', enum: TrainingMaterialTypeEnum })
  type!: TrainingMaterialTypeEnum;

  @Column({ type: 'text', name: 'file_url', nullable: true })
  fileUrl!: string | null;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;
}
