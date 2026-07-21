import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'authority_level',
    type: 'int',
    default: 0,
    comment: 'Higher value = Higher authority. MAX is 100.',
  })
  authorityLevel!: number;

  @Column({
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @Column({
    name: 'is_system',
    default: false,
    comment: 'System roles cannot be deleted',
  })
  isSystem!: boolean;

  @Column({
    name: 'is_protected',
    default: false,
    comment: 'Protected roles cannot have their name, permissions, or authority level modified',
  })
  isProtected!: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions!: Permission[];
}
