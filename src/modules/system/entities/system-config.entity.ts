import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Generic application configuration store.
 * Used to persist runtime system flags (e.g. "system.bootstrapped") and settings.
 * Not bootstrap-specific — can hold any application-level config key-value pair.
 */
@Entity('system_config')
export class SystemConfig {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
