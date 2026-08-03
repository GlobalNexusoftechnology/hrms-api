import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { DataScopeEnum } from '../enums/data-scope.enum';
import { TeamMember } from '../../modules/team/entities/team-member.entity';

export interface DataScopePathConfig {
  /** The path to the branchId (e.g., 'employee.branchId', 'department.branchId') */
  branch?: string;
  /** The path to the departmentId (e.g., 'employee.departmentId', 'team.departmentId'). Required for DEPARTMENT scope */
  department?: string;
  /** The path to the employeeId (e.g., 'employee.id', 'attendance.employeeId'). Required for TEAM and SELF scope */
  employee?: string;
}

@Injectable()
export class DataScopeService {
  /**
   * Translates camelCase TypeORM property paths to snake_case database column paths for raw SQL fragments.
   * e.g., 'department.branchId' -> 'department.branch_id'
   */
  private toColumnPath(path?: string): string | undefined {
    if (!path) return undefined;
    return path
      .replace(/\.branchId$/, '.branch_id')
      .replace(/\.departmentId$/, '.department_id')
      .replace(/\.employeeId$/, '.employee_id');
  }

  /**
   * Applies data scope authorization to a query builder.
   * Ensures that the returned records belong to the user's allowed scope.
   *
   * @param qb The TypeORM SelectQueryBuilder
   * @param currentUser The currently authenticated employee
   * @param paths Configuration detailing the relationship paths to the required entity keys
   */
  applyScope<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    currentUser: Employee,
    paths: DataScopePathConfig,
  ): SelectQueryBuilder<T> {
    const dataScope = currentUser.role?.dataScope || DataScopeEnum.SELF;

    // Generate a unique parameter suffix to prevent collisions with existing query builder parameters
    const pId = Math.random().toString(36).substring(2, 9);

    switch (dataScope) {
      case DataScopeEnum.ORGANIZATION:
        // No restrictions; user can see all records in the organization
        return qb;

      case DataScopeEnum.BRANCH:
        if (!currentUser.branchId || !paths.branch) {
          // If the user has no branch or path doesn't specify one, fallback to self if possible
          if (paths.employee) {
            const empCol = this.toColumnPath(paths.employee)!;
            return qb.andWhere(`${empCol} = :userId_${pId}`, {
              [`userId_${pId}`]: currentUser.id,
            });
          }
          // User has no branch specified, fallback to organization level
          return qb;
        }
        const branchCol = this.toColumnPath(paths.branch)!;
        return qb.andWhere(`(${branchCol} = :branchId_${pId} OR ${branchCol} IS NULL)`, {
          [`branchId_${pId}`]: currentUser.branchId,
        });

      case DataScopeEnum.DEPARTMENT:
        if (!currentUser.departmentId || !paths.department) {
          // Fallback to self if possible
          if (paths.employee) {
            const empCol = this.toColumnPath(paths.employee)!;
            return qb.andWhere(`${empCol} = :userId_${pId}`, {
              [`userId_${pId}`]: currentUser.id,
            });
          }
          return qb;
        }
        const deptCol = this.toColumnPath(paths.department)!;
        return qb.andWhere(`(${deptCol} = :departmentId_${pId} OR ${deptCol} IS NULL)`, {
          [`departmentId_${pId}`]: currentUser.departmentId,
        });

      case DataScopeEnum.TEAM:
        if (!paths.employee) {
          return qb.andWhere('1 = 0'); // TEAM scope requires an employee relationship
        }
        const empColTeam = this.toColumnPath(paths.employee)!;

        // Access to employees sharing at least one team membership with the current user
        const teamSubQuery = qb.connection
          .createQueryBuilder(TeamMember, `tm1_${pId}`)
          .select(`tm1_${pId}.teamId`)
          .where(`tm1_${pId}.employeeId = :userId_${pId}`);

        const employeeSubQuery = qb.connection
          .createQueryBuilder(TeamMember, `tm2_${pId}`)
          .select(`tm2_${pId}.employeeId`)
          .where(`tm2_${pId}.teamId IN (${teamSubQuery.getQuery()})`);

        return qb.andWhere(
          `${empColTeam} IN (${employeeSubQuery.getQuery()})`,
          { [`userId_${pId}`]: currentUser.id },
        );

      case DataScopeEnum.SELF:
      default:
        if (!paths.employee) {
          return qb.andWhere('1 = 0'); // SELF scope requires an employee relationship
        }
        const selfCol = this.toColumnPath(paths.employee)!;
        // Only their own record
        return qb.andWhere(`${selfCol} = :userId_${pId}`, {
          [`userId_${pId}`]: currentUser.id,
        });
    }
  }
}
