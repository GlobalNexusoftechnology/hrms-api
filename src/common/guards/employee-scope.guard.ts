import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { DataScopeService } from '../services/data-scope.service';

@Injectable()
export class EmployeeScopeGuard implements CanActivate {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Only apply to routes that are specifically accessing a single employee's data
    const path = request.route?.path;
    if (!path || !path.includes('/employees/:')) {
      return true;
    }

    // Support both :employeeId and :id parameter names
    const targetEmployeeId = params.employeeId || params.id;

    if (!targetEmployeeId) {
      return true;
    }

    const qb = this.employeeRepository
      .createQueryBuilder('employee')
      .where('employee.id = :id', { id: targetEmployeeId });

    this.dataScopeService.applyScope(qb, user, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id',
    });

    const hasAccess = await qb.getExists();

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access or modify this employee record.',
      );
    }

    return true;
  }
}
