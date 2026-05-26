import { DataSource } from 'typeorm';

import { Department } from '../../modules/departments/entities/department.entity';

import { Designation } from '../../modules/designations/entities/designation.entity';

export async function seedDepartmentDesignation(dataSource: DataSource) {
  const departmentRepo = dataSource.getRepository(Department);

  const designationRepo = dataSource.getRepository(Designation);

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
    let department = await departmentRepo.findOne({
      where: [
        {
          code: dept.code,
        },

        {
          name: dept.name,
        },
      ],
    });

    // CREATE IF NOT EXISTS
    if (!department) {
      department = await departmentRepo.save({
        name: dept.name,

        code: dept.code,

        description: dept.description,
      });

      console.log(`Department Created: ${dept.name}`);
    } else {
      // FIX OLD NULL VALUES
      let updated = false;

      if (!department.code) {
        department.code = dept.code;

        updated = true;
      }

      if (!department.description) {
        department.description = dept.description;

        updated = true;
      }

      if (updated) {
        await departmentRepo.save(department);

        console.log(`Department Updated: ${dept.name}`);
      }
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
        ['Software Intern', 'SW_INTERN'],

        ['Junior Software Engineer', 'JR_SW_ENG'],

        ['Software Engineer', 'SW_ENG'],

        ['Senior Software Engineer', 'SR_SW_ENG'],

        ['Tech Lead', 'TECH_LEAD'],

        ['Engineering Manager', 'ENG_MANAGER'],
      ],
    },

    {
      departmentCode: 'HR',

      items: [
        ['HR Intern', 'HR_INTERN'],

        ['HR Executive', 'HR_EXEC'],

        ['Senior HR Executive', 'SR_HR_EXEC'],

        ['HR Manager', 'HR_MANAGER'],

        ['HR Director', 'HR_DIRECTOR'],
      ],
    },

    {
      departmentCode: 'SALES',

      items: [
        ['Sales Executive', 'SALES_EXEC'],

        ['Senior Sales Executive', 'SR_SALES_EXEC'],

        ['Business Development Executive', 'BDE'],

        ['Sales Manager', 'SALES_MANAGER'],

        ['Regional Sales Manager', 'REGIONAL_SALES_MANAGER'],
      ],
    },

    {
      departmentCode: 'MKT',

      items: [
        ['Marketing Executive', 'MARKETING_EXEC'],

        ['Digital Marketing Specialist', 'DIGITAL_MARKETING'],

        ['SEO Specialist', 'SEO_SPECIALIST'],

        ['Content Strategist', 'CONTENT_STRATEGIST'],

        ['Marketing Manager', 'MARKETING_MANAGER'],
      ],
    },

    {
      departmentCode: 'FIN',

      items: [
        ['Accountant', 'ACCOUNTANT'],

        ['Senior Accountant', 'SR_ACCOUNTANT'],

        ['Finance Executive', 'FIN_EXEC'],

        ['Finance Manager', 'FIN_MANAGER'],

        ['Finance Controller', 'FIN_CONTROLLER'],
      ],
    },
  ];

  for (const group of designations) {
    const department = departmentMap[group.departmentCode];

    for (const [name, code] of group.items) {
      const existing = await designationRepo.findOne({
        where: [
          {
            code,
          },

          {
            name,
          },
        ],
      });

      if (existing) {
        continue;
      }

      await designationRepo.save({
        name,

        code,

        departmentId: department.id,
      });

      console.log(`Designation Created: ${name}`);
    }
  }

  console.log('Department & Designation Seed Completed');
}
