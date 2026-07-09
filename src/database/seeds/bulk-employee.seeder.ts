import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Role } from '../../modules/roles/entities/role.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { Designation } from '../../modules/designations/entities/designation.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';

import { EmploymentTypeEnum } from '../../common/enums/employment-type.enum';
import { GenderEnum } from '../../common/enums/gender.enum';

export async function seedBulkEmployees(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const departmentRepository = dataSource.getRepository(Department);
  const designationRepository = dataSource.getRepository(Designation);
  const employeeRepository = dataSource.getRepository(Employee);

  const employeeRole = await roleRepository.findOne({ where: { name: 'EMPLOYEE' } });
  if (!employeeRole) {
    console.log('EMPLOYEE role not found, skipping bulk employee seed');
    return;
  }

  const departments = await departmentRepository.find();
  const designations = await designationRepository.find();

  if (!departments.length || !designations.length) {
    console.log('Departments or Designations not found, skipping');
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const allEmployees = await employeeRepository.find({ select: { employeeCode: true } });
  let lastNumber = 0;
  for (const emp of allEmployees) {
    if (emp.employeeCode) {
      const match = emp.employeeCode.match(/EMP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > lastNumber) {
          lastNumber = num;
        }
      }
    }
  }
  
  const targetNewCount = 50;



  const employeesToSave: any[] = [];

  for (let i = 1; i <= targetNewCount; i++) {
    const dept = departments[i % departments.length];
    const deptDesignations = designations.filter(d => d.departmentId === dept.id);
    const desig = deptDesignations.length > 0 ? deptDesignations[i % deptDesignations.length] : designations[i % designations.length];

    const empCodeNumber = lastNumber + i;
    const paddedCode = empCodeNumber.toString().padStart(3, '0');

    employeesToSave.push({
      employeeCode: `EMP-${paddedCode}`,
      firstName: `User`,
      lastName: `${empCodeNumber}`,
      email: `bulk.employee.${empCodeNumber}@giga.com`,
      mobile: `98${empCodeNumber.toString().padStart(8, '0')}`,
      password: hashedPassword,
      roleId: employeeRole.id,
      departmentId: dept.id,
      designationId: desig.id,
      gender: i % 2 === 0 ? GenderEnum.FEMALE : GenderEnum.MALE,
      employmentType: EmploymentTypeEnum.FULL_TIME,
      joiningDate: new Date(),
      isActive: true,
    });
  }

  await employeeRepository.save(employeesToSave);
  console.log(`Successfully seeded ${targetNewCount} bulk employees`);
}
