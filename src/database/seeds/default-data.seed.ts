import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Role } from '../../modules/roles/entities/role.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { Designation } from '../../modules/designations/entities/designation.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';

import { EmploymentTypeEnum } from '../../common/enums/employment-type.enum';
import { GenderEnum } from '../../common/enums/gender.enum';

export async function seedDefaultData(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const departmentRepository = dataSource.getRepository(Department);

  const designationRepository = dataSource.getRepository(Designation);

  const employeeRepository = dataSource.getRepository(Employee);

  // -----------------
  // ROLES
  // -----------------
  const superAdminRole = await roleRepository.findOne({
    where: {
      name: 'SUPER_ADMIN',
    },
  });

  const hrRole = await roleRepository.findOne({
    where: {
      name: 'HR',
    },
  });

  const employeeRole = await roleRepository.findOne({
    where: {
      name: 'EMPLOYEE',
    },
  });

  if (!superAdminRole || !hrRole || !employeeRole) {
    throw new Error('Roles not found. Run RBAC seed first.');
  }

  // -----------------
  // DEPARTMENTS
  // -----------------
  let hrDepartment = await departmentRepository.findOne({
    where: [
      {
        code: 'HR',
      },
      {
        name: 'Human Resource',
      },
    ],
  });

  if (!hrDepartment) {
    hrDepartment = await departmentRepository.save({
      name: 'Human Resource',

      code: 'HR',

      description: 'HR Department',
    });
  }

  let itDepartment = await departmentRepository.findOne({
    where: [
      {
        code: 'IT',
      },
      {
        name: 'Information Technology',
      },
    ],
  });

  if (!itDepartment) {
    itDepartment = await departmentRepository.save({
      name: 'Information Technology',

      code: 'IT',

      description: 'IT Department',
    });
  }

  // -----------------
  // DESIGNATIONS
  // -----------------
  let hrManager = await designationRepository.findOne({
    where: [
      {
        code: 'HR_MANAGER',
      },
      {
        name: 'HR Manager',
      },
    ],
  });

  if (!hrManager) {
    hrManager = await designationRepository.save({
      name: 'HR Manager',

      code: 'HR_MANAGER',

      departmentId: hrDepartment.id,
    });
  }

  let backendDeveloper = await designationRepository.findOne({
    where: [
      {
        code: 'BACKEND_DEV',
      },
      {
        name: 'Backend Developer',
      },
    ],
  });

  if (!backendDeveloper) {
    backendDeveloper = await designationRepository.save({
      name: 'Backend Developer',

      code: 'BACKEND_DEV',

      departmentId: itDepartment.id,
    });
  }

  // -----------------
  // PASSWORD
  // -----------------
  const hashedPassword = await bcrypt.hash('123456', 10);

  // -----------------
  // SUPER ADMIN
  // -----------------
  const existingSuperAdmin = await employeeRepository.findOne({
    where: [
      {
        email: 'superadmin@giga.com',
      },
      {
        employeeCode: 'EMP-001',
      },
      {
        mobile: '9999999991',
      },
    ],
  });

  if (!existingSuperAdmin) {
    await employeeRepository.save({
      employeeCode: 'EMP-001',

      firstName: 'Super',

      lastName: 'Admin',

      email: 'superadmin@giga.com',

      mobile: '9999999991',

      password: hashedPassword,

      roleId: superAdminRole.id,

      departmentId: itDepartment.id,

      designationId: backendDeveloper.id,

      gender: GenderEnum.MALE,

      employmentType: EmploymentTypeEnum.FULL_TIME,

      joiningDate: new Date(),

      isActive: true,
    });
  }

  // -----------------
  // HR
  // -----------------
  const existingHr = await employeeRepository.findOne({
    where: [
      {
        email: 'hr@giga.com',
      },
      {
        employeeCode: 'EMP-002',
      },
      {
        mobile: '9999999992',
      },
    ],
  });

  if (!existingHr) {
    await employeeRepository.save({
      employeeCode: 'EMP-002',

      firstName: 'HR',

      lastName: 'Manager',

      email: 'hr@giga.com',

      mobile: '9999999992',

      password: hashedPassword,

      roleId: hrRole.id,

      departmentId: hrDepartment.id,

      designationId: hrManager.id,

      gender: GenderEnum.MALE,

      employmentType: EmploymentTypeEnum.FULL_TIME,

      joiningDate: new Date(),

      isActive: true,
    });
  }

  // -----------------
  // EMPLOYEE
  // -----------------
  const existingEmployee = await employeeRepository.findOne({
    where: [
      {
        email: 'employee@giga.com',
      },
      {
        employeeCode: 'EMP-003',
      },
      {
        mobile: '9999999993',
      },
    ],
  });

  if (!existingEmployee) {
    await employeeRepository.save({
      employeeCode: 'EMP-003',

      firstName: 'Normal',

      lastName: 'Employee',

      email: 'employee@giga.com',

      mobile: '9999999993',

      password: hashedPassword,

      roleId: employeeRole.id,

      departmentId: itDepartment.id,

      designationId: backendDeveloper.id,

      gender: GenderEnum.MALE,

      employmentType: EmploymentTypeEnum.FULL_TIME,

      joiningDate: new Date(),

      isActive: true,
    });
  }

  console.log('Default data seeded');
}
