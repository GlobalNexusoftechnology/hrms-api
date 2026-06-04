import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Training } from './training.entity';

import { TrainingMaterialTypeEnum } from '../../../common/enums/training-material-type.enum';

@Entity('training_materials')
export class TrainingMaterial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'training_id',
  })
  trainingId!: string;

  @ManyToOne(() => Training, (training) => training.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'training_id',
  })
  training!: Training;

  @Column()
  title!: string;

  @Column({
    type: 'enum',

    enum: TrainingMaterialTypeEnum,
  })
  type!: TrainingMaterialTypeEnum;

  @Column({
    type: 'text',

    nullable: true,

    name: 'file_url',
  })
  fileUrl!: string | null;

  @Column({
    type: 'text',

    nullable: true,

    name: 'video_url',
  })
  videoUrl!: string | null;

  @Column({
    default: 1,

    name: 'sort_order',
  })
  sortOrder!: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
