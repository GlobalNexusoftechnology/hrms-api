import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CourseModule } from './course-module.entity';
import { CourseMaterial } from './course-material.entity';

@Entity('course_topics')
export class CourseTopic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'module_id' })
  moduleId!: string;

  @ManyToOne(() => CourseModule, mod => mod.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: CourseModule;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;

  @OneToMany(() => CourseMaterial, material => material.topic)
  materials!: CourseMaterial[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}