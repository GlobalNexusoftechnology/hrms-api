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

  // =====================
  // ROLES
  // =====================

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

  // =====================
  // DEPARTMENTS
  // =====================

  const departments = [
    {
      name: 'Engineering',
      code: 'ENG',
      description: 'Engineering Department',
    },

    {
      name: 'Human Resources',
      code: 'HR',
      description: 'HR Department',
    },

    {
      name: 'Sales',
      code: 'SALES',
      description: 'Sales Department',
    },

    {
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing Department',
    },

    {
      name: 'Finance',
      code: 'FIN',
      description: 'Finance Department',
    },
  ];

  const departmentMap: Record<string, Department> = {};

  for (const dept of departments) {
    let department = await departmentRepository.findOne({
      where: [
        {
          code: dept.code,
        },

        {
          name: dept.name,
        },
      ],
    });

    if (!department) {
      department = await departmentRepository.save(dept);

      console.log(`Department Created: ${dept.name}`);
    }

    departmentMap[dept.code] = department;
  }

  // =====================
  // DESIGNATIONS
  // =====================

  const designations = [
    {
      departmentCode: 'ENG',

      items: [
        {
          name: 'Software Intern',
          code: 'SW_INTERN',
        },

        {
          name: 'Junior Software Engineer',
          code: 'JR_SW_ENG',
        },

        {
          name: 'Software Engineer',
          code: 'SW_ENG',
        },

        {
          name: 'Senior Software Engineer',
          code: 'SR_SW_ENG',
        },

        {
          name: 'Tech Lead',
          code: 'TECH_LEAD',
        },

        {
          name: 'Engineering Manager',
          code: 'ENG_MANAGER',
        },
      ],
    },

    {
      departmentCode: 'HR',

      items: [
        {
          name: 'HR Intern',
          code: 'HR_INTERN',
        },

        {
          name: 'HR Executive',
          code: 'HR_EXEC',
        },

        {
          name: 'Senior HR Executive',
          code: 'SR_HR_EXEC',
        },

        {
          name: 'HR Manager',
          code: 'HR_MANAGER',
        },

        {
          name: 'HR Director',
          code: 'HR_DIRECTOR',
        },
      ],
    },

    {
      departmentCode: 'SALES',

      items: [
        {
          name: 'Sales Executive',
          code: 'SALES_EXEC',
        },

        {
          name: 'Senior Sales Executive',
          code: 'SR_SALES_EXEC',
        },

        {
          name: 'Business Development Executive',
          code: 'BDE',
        },

        {
          name: 'Sales Manager',
          code: 'SALES_MANAGER',
        },

        {
          name: 'Regional Sales Manager',
          code: 'REGIONAL_SALES_MANAGER',
        },
      ],
    },

    {
      departmentCode: 'MKT',

      items: [
        {
          name: 'Marketing Executive',
          code: 'MARKETING_EXEC',
        },

        {
          name: 'Digital Marketing Specialist',
          code: 'DIGITAL_MARKETING',
        },

        {
          name: 'SEO Specialist',
          code: 'SEO_SPECIALIST',
        },

        {
          name: 'Content Strategist',
          code: 'CONTENT_STRATEGIST',
        },

        {
          name: 'Marketing Manager',
          code: 'MARKETING_MANAGER',
        },
      ],
    },

    {
      departmentCode: 'FIN',

      items: [
        {
          name: 'Accountant',
          code: 'ACCOUNTANT',
        },

        {
          name: 'Senior Accountant',
          code: 'SR_ACCOUNTANT',
        },

        {
          name: 'Finance Executive',
          code: 'FIN_EXEC',
        },

        {
          name: 'Finance Manager',
          code: 'FIN_MANAGER',
        },

        {
          name: 'Finance Controller',
          code: 'FIN_CONTROLLER',
        },
      ],
    },
  ];

  const designationMap: Record<string, Designation> = {};

  for (const group of designations) {
    const department = departmentMap[group.departmentCode];

    for (const item of group.items) {
      let designation = await designationRepository.findOne({
        where: [
          {
            code: item.code,
          },

          {
            name: item.name,
          },
        ],
      });

      if (!designation) {
        designation = await designationRepository.save({
          name: item.name,

          code: item.code,

          departmentId: department.id,
        });

        console.log(`Designation Created: ${item.name}`);
      }

      designationMap[item.code] = designation;
    }
  }

  // =====================
  // PASSWORD
  // =====================

  const hashedPassword = await bcrypt.hash('123456', 10);

  // =====================
  // SUPER ADMIN
  // =====================

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

      departmentId: departmentMap['ENG'].id,

      designationId: designationMap['SW_ENG'].id,

      gender: GenderEnum.MALE,

      employmentType: EmploymentTypeEnum.FULL_TIME,

      joiningDate: new Date(),

      isActive: true,
    });

    console.log('Super Admin Created');
  } else {
    console.log('Super Admin Already Exists');
  }
  // =====================
  // HR
  // =====================

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

      departmentId: departmentMap['HR'].id,

      designationId: designationMap['HR_MANAGER'].id,

      gender: GenderEnum.MALE,

      employmentType: EmploymentTypeEnum.FULL_TIME,

      joiningDate: new Date(),

      isActive: true,
    });

    console.log('HR Created');
  } else {
    console.log('HR Already Exists');
  }

  // =====================
  // EMPLOYEE
  // =====================

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

      departmentId: departmentMap['ENG'].id,

      designationId: designationMap['JR_SW_ENG'].id,

      gender: GenderEnum.MALE,

      employmentType: EmploymentTypeEnum.FULL_TIME,

      joiningDate: new Date(),

      isActive: true,
    });

    console.log('Employee Created');
  } else {
    console.log('Employee Already Exists');
  }

  console.log('Default data seeded successfully');
}
