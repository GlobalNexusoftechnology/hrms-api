import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from './entities/employee.entity';
import type { Response } from 'express';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeesDto } from './dto/get-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';
import { Role } from '../roles/entities/role.entity';
import { extname } from 'path';
import * as fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import * as QRCode from 'qrcode';
import * as path from 'path';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { DataScopeService } from '../../common/services/data-scope.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly dataScopeService: DataScopeService,
  ) { }

  async generateEmployeeCode(): Promise<string> {
    const latestEmployee = await this.employeeRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    let nextNumber = 1;

    if (latestEmployee.length > 0 && latestEmployee[0].employeeCode) {
      const lastNumber = Number.parseInt(
        latestEmployee[0].employeeCode.split('-')[1],
        10,
      );

      if (!Number.isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `EMP-${String(nextNumber).padStart(3, '0')}`;
  }

  async create(dto: CreateEmployeeDto) {
    dto.email = dto.email.trim().toLowerCase();

    const existingEmail = await this.employeeRepository.findOne({
      where: {
        email: dto.email,
        deletedAt: IsNull(),
      },
    });

    if (existingEmail) {
      throw new ConflictException(`Email '${dto.email}' already exists`);
    }

    const existingMobile = await this.employeeRepository.findOne({
      where: {
        mobile: dto.mobile,
        deletedAt: IsNull(),
      },
    });

    if (existingMobile) {
      throw new ConflictException(`Mobile '${dto.mobile}' already exists`);
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: dto.roleId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.designationId && !dto.departmentId) {
      throw new BadRequestException(
        'Department is required when designation is selected',
      );
    }

    let department: Department | null = null;

    if (dto.departmentId) {
      if (!dto.branchId) {
        throw new BadRequestException('Branch is required when department is selected');
      }

      department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      if (department.branchId && department.branchId !== dto.branchId) {
        throw new BadRequestException('Selected department does not belong to the selected branch');
      }
    }

    let designation: Designation | null = null;

    if (dto.designationId) {
      designation = await this.designationRepository.findOne({
        where: {
          id: dto.designationId,
          deletedAt: IsNull(),
          isActive: true,
        },
        relations: {
          department: true,
        },
      });

      if (!designation) {
        throw new NotFoundException('Designation not found');
      }

      if (dto.departmentId && designation.departmentId !== dto.departmentId) {
        throw new BadRequestException(
          'Designation does not belong to selected department',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const employeeCode = await this.generateEmployeeCode();

    const employee = this.employeeRepository.create({
      firstName: dto.firstName,

      lastName: dto.lastName,

      email: dto.email,

      mobile: dto.mobile,

      currentAddress: dto.currentAddress,

      password: hashedPassword,

      roleId: dto.roleId,

      branchId: dto.branchId,

      departmentId: dto.departmentId,

      designationId: dto.designationId,

      joiningDate: dto.joiningDate,

      employmentType: dto.employmentType,

      gender: dto.gender,

      dateOfBirth: dto.dateOfBirth,

      employeeCode,
    });

    try {
      await this.employeeRepository.save(employee);

      return this.findOne(employee.id);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('email')) {
          throw new ConflictException('Email already exists');
        }

        if (error.detail?.includes('mobile')) {
          throw new ConflictException('Mobile already exists');
        }

        if (error.detail?.includes('employee_code')) {
          throw new ConflictException('Employee code already exists');
        }

        throw new ConflictException('Employee already exists');
      }

      throw error;
    }
  }

  async findByIdentifier(identifier: string) {
    return this.employeeRepository.findOne({
      where: [
        {
          email: identifier,
        },
        {
          employeeCode: identifier,
        },
      ],

      relations: {
        role: {
          permissions: true,
        },
      },

      select: {
        id: true,
        email: true,
        employeeCode: true,
        password: true,
        passwordVersion: true,
        roleId: true,
        isActive: true,
        role: {
          id: true,
          name: true,
          permissions: true,
        },
      },
    });
  }

  async findById(id: string) {
    return this.employeeRepository.findOne({
      where: {
        id,
      },

      relations: {
        role: {
          permissions: true,
        },
      },
    });
  }

  async findAll(query: GetEmployeesDto, currentUser: Employee) {
    const {
      page = '1',
      limit = '10',
      search,
      roleId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      departmentId,
      designationId,
      gender,
      employmentType,
    } = query;

    const pageNumber = Math.max(Number(page), 1);

    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const sortableColumns = {
      createdAt: 'employee.created_at',

      firstName: 'employee.first_name',

      lastName: 'employee.last_name',

      email: 'employee.email',

      employeeCode: 'employee.employee_code',

      mobile: 'employee.mobile',
    };

    const orderBy = sortableColumns[sortBy] ?? 'employee.created_at';

    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')

      .distinct(true)

      .leftJoinAndSelect('employee.role', 'role')

      .leftJoinAndSelect('employee.department', 'department')

      .leftJoinAndSelect('employee.designation', 'designation')

      .leftJoinAndSelect('role.permissions', 'permissions');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('employee.first_name ILIKE :search')
            .orWhere('employee.last_name ILIKE :search')
            .orWhere('employee.email ILIKE :search')
            .orWhere('employee.employee_code ILIKE :search')
            .orWhere('employee.mobile ILIKE :search');
        }),
        {
          search: `%${search.trim()}%`,
        },
      );
    }

    if (roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }

    if (departmentId) {
      queryBuilder.andWhere('department.id = :departmentId', {
        departmentId,
      });
    }

    if (designationId) {
      queryBuilder.andWhere('designation.id = :designationId', {
        designationId,
      });
    }

    if (gender) {
      queryBuilder.andWhere('employee.gender = :gender', {
        gender,
      });
    }

    if (employmentType) {
      queryBuilder.andWhere(
        `
      employee.employment_type =
      :employmentType
      `,
        {
          employmentType,
        },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere(
        `
      employee.is_active =
      :isActive
      `,
        {
          isActive: isActive === 'true',
        },
      );
    }

    this.dataScopeService.applyScope(queryBuilder, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });

    queryBuilder.orderBy(orderBy, sortOrder);

    queryBuilder.skip((pageNumber - 1) * limitNumber);

    queryBuilder.take(limitNumber);

    const [employees, total] = await queryBuilder.getManyAndCount();

    return {
      data: employees,

      meta: {
        page: pageNumber,

        limit: limitNumber,

        total,

        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: string, currentUser?: Employee) {
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee')
      .leftJoinAndSelect('employee.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('employee.id = :id', { id });

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
        employee: 'employee.id'
      });
    }

    const employee = await queryBuilder.getOne();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // EMAIL DUPLICATE CHECK
    if (dto.email) {
      dto.email = dto.email.trim().toLowerCase();

      const existingEmail = await this.employeeRepository.findOne({
        where: {
          email: dto.email,
          deletedAt: IsNull(),
        },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException(`Email '${dto.email}' already exists`);
      }
    }

    // MOBILE DUPLICATE CHECK
    if (dto.mobile) {
      const existingMobile = await this.employeeRepository.findOne({
        where: {
          mobile: dto.mobile,
          deletedAt: IsNull(),
        },
      });

      if (existingMobile && existingMobile.id !== id) {
        throw new ConflictException(`Mobile '${dto.mobile}' already exists`);
      }
    }

    // PASSWORD HASH
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const branchId = dto.branchId !== undefined ? dto.branchId : employee.branchId;
    const departmentId = dto.departmentId !== undefined ? dto.departmentId : employee.departmentId;

    if (departmentId) {
      if (!branchId) {
        throw new BadRequestException('Branch is required when department is selected');
      }
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId, deletedAt: IsNull(), isActive: true }
      });
      if (!department) throw new NotFoundException('Department not found');
      if (department.branchId && department.branchId !== branchId) {
        throw new BadRequestException('Selected department does not belong to the selected branch');
      }
    }

    Object.assign(employee, dto);

    await this.employeeRepository.save(employee);

    // REVOKE TOKENS AFTER SUCCESSFUL DEACTIVATION
    if (dto.isActive === false) {
      await this.refreshTokenRepository.update(
        {
          employeeId: employee.id,
          isRevoked: false,
        },
        {
          isRevoked: true,
        },
      );
    }

    return this.findOne(employee.id);
  }

  async uploadProfilePhoto(id: string, file: Express.Multer.File) {
    const employee = await this.findOne(id);

    if (!file) {
      throw new BadRequestException('Photo is required');
    }

    const extension = extname(file.originalname);
    const newFileName = `${employee.employeeCode}_profile_${Date.now()}${extension}`;

    const oldPath = file.path;

    const newPath = `uploads/profiles/${newFileName}`;

    fs.renameSync(oldPath, newPath);

    employee.profilePhoto = `/uploads/profiles/${newFileName}`;

    await this.employeeRepository.save(employee);

    return {
      message: 'Profile photo uploaded successfully',

      profilePhoto: employee.profilePhoto,
    };
  }

  async remove(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeRepository.softDelete(id);

    return {
      message: 'Employee deleted successfully',
    };
  }

  async restore(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeRepository.restore(id);

    return {
      message: 'Employee restored successfully',
    };
  }

  async generateIdCard(
    id: string,

    res: Response<any>,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },

      relations: {
        department: true,

        designation: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const canvas = createCanvas(800, 500);

    const ctx = canvas.getContext('2d');

    // BACKGROUND
    ctx.fillStyle = '#ffffff';

    ctx.fillRect(0, 0, 800, 500);

    // HEADER
    ctx.fillStyle = '#1E40AF';

    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';

    ctx.font = 'bold 36px Arial';

    ctx.fillText('GIGA SYSTEM', 280, 60);

    // PROFILE PHOTO
    if (employee.profilePhoto) {
      const imagePath = path.join(process.cwd(), employee.profilePhoto);

      const image = await loadImage(imagePath);

      ctx.drawImage(image, 40, 140, 140, 140);
    }

    // QR CODE
    const qrData = await QRCode.toDataURL(
      JSON.stringify({
        employeeId: employee.id,

        employeeCode: employee.employeeCode,
      }),
    );

    const qrImage = await loadImage(qrData);

    ctx.drawImage(qrImage, 620, 300, 120, 120);

    // TEXT
    ctx.fillStyle = '#000000';

    ctx.font = 'bold 28px Arial';

    ctx.fillText(`${employee.firstName} ${employee.lastName}`, 220, 160);

    ctx.font = '22px Arial';

    ctx.fillText(`ID: ${employee.employeeCode}`, 220, 210);

    ctx.fillText(`Department: ${employee.department?.name ?? 'N/A'}`, 220, 250);

    ctx.fillText(
      `Designation: ${employee.designation?.name ?? 'N/A'}`,
      220,
      290,
    );

    ctx.fillText(`DOB: ${employee.dateOfBirth ?? 'N/A'}`, 220, 330);

    ctx.fillText(`Address: ${employee.currentAddress ?? 'N/A'}`, 220, 370);

    res.setHeader('Content-Type', 'image/png');

    canvas.createPNGStream().pipe(res);
  }

  async updateLastLogin(employeeId: string) {
    await this.employeeRepository.update(employeeId, {
      lastLoginAt: new Date(),
    });
  }
}
