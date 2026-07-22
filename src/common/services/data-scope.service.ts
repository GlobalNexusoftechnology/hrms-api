import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { DataScopeEnum } from '../enums/data-scope.enum';

export interface DataScopePathConfig {
  /** The path to the branchId (e.g., 'employee.branchId', 'department.branchId') */
  branch: string;
  /** The path to the departmentId (e.g., 'employee.departmentId', 'team.departmentId'). Required for DEPARTMENT scope */
  department?: string;
  /** The path to the employeeId (e.g., 'employee.id', 'attendance.employeeId'). Required for TEAM and SELF scope */
  employee?: string;
}

@Injectable()
export class DataScopeService {
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

    switch (dataScope) {
      case DataScopeEnum.ORGANIZATION:
        // No restrictions; user can see all records in the organization
        return qb;

      case DataScopeEnum.BRANCH:
        if (!currentUser.branchId) {
          // If the user has no branch, fallback to self if possible, otherwise return no results
          if (paths.employee) return qb.andWhere(`${paths.employee} = :userId`, { userId: currentUser.id });
          return qb.andWhere('1 = 0');
        }
        return qb.andWhere(`${paths.branch} = :branchId`, {
          branchId: currentUser.branchId,
        });

      case DataScopeEnum.DEPARTMENT:
        if (!currentUser.departmentId) {
          if (paths.employee) return qb.andWhere(`${paths.employee} = :userId`, { userId: currentUser.id });
          return qb.andWhere('1 = 0');
        }
        if (!paths.department) {
           return qb.andWhere('1 = 0');
        }
        return qb.andWhere(`${paths.department} = :departmentId`, {
          departmentId: currentUser.departmentId,
        });

      case DataScopeEnum.TEAM:
        if (!paths.employee) {
          return qb.andWhere('1 = 0'); // TEAM scope requires an employee relationship
        }
        // Access to employees sharing at least one team membership with the current user.
        return qb.andWhere(
          `${paths.employee} IN (
            SELECT tm2."employeeId" 
            FROM team_members tm2 
            WHERE tm2."teamId" IN (
              SELECT tm1."teamId" 
              FROM team_members tm1 
              WHERE tm1."employeeId" = :userId
            )
          )`,
          { userId: currentUser.id },
        );

      case DataScopeEnum.SELF:
      default:
        if (!paths.employee) {
          return qb.andWhere('1 = 0'); // SELF scope requires an employee relationship
        }
        // Only their own record
        return qb.andWhere(`${paths.employee} = :userId`, { userId: currentUser.id });
    }
  }
}
