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
import { Organization } from '../organization/entities/organization.entity';
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
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '../activity-log/enums/activity-action.enum';

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
    private readonly activityLogService: ActivityLogService,
  ) {}

  async generateEmployeeCode(): Promise<string> {
    const allEmployees = await this.employeeRepository.find({
      select: { employeeCode: true },
      withDeleted: true,
    });

    let maxNumber = 0;

    for (const emp of allEmployees) {
      if (emp.employeeCode && emp.employeeCode.startsWith('EMP-')) {
        const parts = emp.employeeCode.split('-');
        if (parts.length > 1) {
          const num = Number.parseInt(parts[1], 10);
          if (!Number.isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }

    const nextNumber = maxNumber + 1;
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
        throw new BadRequestException(
          'Branch is required when department is selected',
        );
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
        throw new BadRequestException(
          'Selected department does not belong to the selected branch',
        );
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

      middleName: dto.middleName,

      displayName: dto.displayName,

      email: dto.email,

      personalEmail: dto.personalEmail,

      mobile: dto.mobile,

      alternatePhone: dto.alternatePhone,

      password: hashedPassword,

      roleId: dto.roleId,

      branchId: dto.branchId,

      departmentId: dto.departmentId,

      designationId: dto.designationId,

      shiftId: dto.shiftId,

      joiningDate: dto.joiningDate,

      employmentType: dto.employmentType,

      employmentStatus: dto.employmentStatus,

      workLocation: dto.workLocation,

      maritalStatus: dto.maritalStatus,

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

  async assignRole(id: string, roleId: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId, deletedAt: IsNull(), isActive: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found or is inactive');
    }

    employee.roleId = roleId;
    await this.employeeRepository.save(employee);

    // Optional: You could invalidate the user's refresh tokens here to force a re-login
    // await this.refreshTokenRepository.delete({ employeeId: id });

    return {
      message: 'Role assigned successfully',
      employeeId: employee.id,
      roleId: role.id,
    };
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
        addresses: true,
        emergencyContacts: true,
        families: true,
        educations: true,
        experiences: true,
        skills: true,
        banks: true,
        department: true,
        designation: true,
        branch: true,
      },
    });
  }

  async findByIdForAuth(id: string) {
    return this.employeeRepository.findOne({
      where: { id },
      relations: {
        role: {
          permissions: true,
        },
      },
      select: {
        id: true,
        email: true,
        employeeCode: true,
        isActive: true,
        roleId: true,
        branchId: true,
        departmentId: true,
        role: {
          id: true,
          name: true,
          dataScope: true,
          authorityLevel: true,
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
      employee: 'employee.id',
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
    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('employee.addresses', 'addresses')
      .leftJoinAndSelect('employee.emergencyContacts', 'emergencyContacts')
      .leftJoinAndSelect('employee.families', 'families')
      .leftJoinAndSelect('employee.educations', 'educations')
      .leftJoinAndSelect('employee.experiences', 'experiences')
      .leftJoinAndSelect('employee.skills', 'skills')
      .leftJoinAndSelect('employee.banks', 'banks')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('employee.branch', 'branch')
      .where('employee.id = :id', { id });

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
        employee: 'employee.id',
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

    const branchId =
      dto.branchId !== undefined ? dto.branchId : employee.branchId;
    const departmentId =
      dto.departmentId !== undefined ? dto.departmentId : employee.departmentId;

    if (departmentId) {
      if (!branchId) {
        throw new BadRequestException(
          'Branch is required when department is selected',
        );
      }
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId, deletedAt: IsNull(), isActive: true },
      });
      if (!department) throw new NotFoundException('Department not found');
      if (department.branchId && department.branchId !== branchId) {
        throw new BadRequestException(
          'Selected department does not belong to the selected branch',
        );
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

  async generateIdCard(id: string, res: Response<any>) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },
      relations: {
        department: true,
        designation: true,
        branch: {
          organization: true,
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const canvas = createCanvas(600, 950);
    const ctx = canvas.getContext('2d');

    let orgName = employee.branch?.organization?.name;
    let orgLogoUrl = employee.branch?.organization?.logoUrl;

    if (!orgName) {
      const org = await this.employeeRepository.manager.findOne(Organization, {
        where: {},
        order: { createdAt: 'ASC' },
      });
      if (org) {
        orgName = org.name;
        orgLogoUrl = org.logoUrl;
      } else {
        orgName = 'GIGA SYSTEM';
      }
    }

    // BACKGROUND
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 950);

    // HEADER
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(0, 0, 600, 200);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    if (orgLogoUrl) {
      try {
        const logoPath = path.join(process.cwd(), orgLogoUrl);
        const logoImage = await loadImage(logoPath);

        // Calculate correct aspect ratio
        const maxLogoWidth = 200;
        const maxLogoHeight = 90;
        const ratio = Math.min(
          maxLogoWidth / logoImage.width,
          maxLogoHeight / logoImage.height,
        );

        const logoWidth = logoImage.width * ratio;
        const logoHeight = logoImage.height * ratio;
        const logoX = (600 - logoWidth) / 2;
        // Vertically center in the upper part of the header
        const logoY = 30;

        // Draw image cleanly
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

        // Organization name below the logo
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(orgName.toUpperCase(), 300, logoY + logoHeight + 40);
      } catch (err) {
        ctx.font = 'bold 36px Arial';
        ctx.fillText(orgName.toUpperCase(), 300, 115);
      }
    } else {
      ctx.font = 'bold 36px Arial';
      ctx.fillText(orgName.toUpperCase(), 300, 115);
    }

    // PROFILE PHOTO (CIRCULAR)
    ctx.save();
    ctx.beginPath();
    ctx.arc(300, 310, 110, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    if (employee.profilePhoto) {
      try {
        const imagePath = path.join(process.cwd(), employee.profilePhoto);
        const image = await loadImage(imagePath);
        ctx.drawImage(image, 190, 200, 220, 220);
      } catch (e) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(190, 200, 220, 220);
      }
    } else {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(190, 200, 220, 220);
    }
    ctx.restore();

    // PROFILE BORDER
    ctx.beginPath();
    ctx.arc(300, 310, 110, 0, Math.PI * 2, true);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // EMPLOYEE NAME & DESIGNATION
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';

    ctx.font = 'bold 42px Arial';
    ctx.fillText(`${employee.firstName} ${employee.lastName}`, 300, 480);

    ctx.fillStyle = '#475569';
    ctx.font = '28px Arial';
    ctx.fillText(employee.designation?.name || 'Employee', 300, 525);

    // DIVIDER LINE
    ctx.beginPath();
    ctx.moveTo(100, 560);
    ctx.lineTo(500, 560);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // DETAILS LIST
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';

    const detailsX = 130;
    let detailsY = 610;

    ctx.font = 'bold 22px Arial';
    ctx.fillText('ID Number:', detailsX, detailsY);
    ctx.font = '22px Arial';
    ctx.fillText(employee.employeeCode, detailsX + 150, detailsY);
    detailsY += 40;

    ctx.font = 'bold 22px Arial';
    ctx.fillText('Department:', detailsX, detailsY);
    ctx.font = '22px Arial';
    ctx.fillText(employee.department?.name || 'N/A', detailsX + 150, detailsY);
    detailsY += 40;

    ctx.font = 'bold 22px Arial';
    ctx.fillText('Mobile:', detailsX, detailsY);
    ctx.font = '22px Arial';
    ctx.fillText(employee.mobile || 'N/A', detailsX + 150, detailsY);
    detailsY += 40;

    ctx.font = 'bold 22px Arial';
    ctx.fillText('DOB:', detailsX, detailsY);
    ctx.font = '22px Arial';
    ctx.fillText(
      employee.dateOfBirth
        ? new Date(employee.dateOfBirth).toLocaleDateString()
        : 'N/A',
      detailsX + 150,
      detailsY,
    );

    // QR CODE
    const qrData = await QRCode.toDataURL(
      JSON.stringify({
        id: employee.id,
        code: employee.employeeCode,
      }),
      { width: 140, margin: 1 },
    );
    const qrImage = await loadImage(qrData);
    ctx.drawImage(qrImage, 230, 770, 140, 140);

    // FOOTER BORDER
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(0, 930, 600, 20);

    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
  }

  async updateLastLogin(employeeId: string) {
    await this.employeeRepository.update(employeeId, {
      lastLoginAt: new Date(),
    });
  }
}
