import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CourseModule } from './course-module.entity';
import { AssessmentQuestion } from './assessment-question.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'module_id' })
  moduleId!: string;

  @OneToOne(() => CourseModule, mod => mod.assessment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: CourseModule;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', name: 'passing_percentage', default: 40 })
  passingPercentage!: number;

  @OneToMany(() => AssessmentQuestion, q => q.assessment)
  questions!: AssessmentQuestion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}