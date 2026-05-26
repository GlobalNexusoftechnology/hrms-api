import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetEmployeesDto } from './dto/get-employees.dto';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

@Controller('employees')
// @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // @Permissions('employee.create')
  @Public()
  @Permissions(PermissionEnum.EMPLOYEE_CREATE)
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  // @Public()
  // @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions('employee.read')
  @Get()
  findAll(
    @Query()
    query: GetEmployeesDto,
  ) {
    return this.employeesService.findAll(query);
  }

  @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.employeesService.findOne(id);
  }

  @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Get(':id/id-card')
  generateIdCard(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Res() res: Response,
  ) {
    return this.employeesService.generateIdCard(id, res);
  }

  @Permissions(PermissionEnum.EMPLOYEE_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.EMPLOYEE_UPDATE)
  @Patch(':id/profile-photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profiles',

        filename: (req, file, callback) => {
          const fileName = `profile_${Date.now()}${extname(file.originalname)}`;

          callback(null, fileName);
        },
      }),

      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadProfilePhoto(
    @Param('id', ParseUUIDPipe)
    id: string,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.employeesService.uploadProfilePhoto(id, file);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions('employee.delete')
  @Permissions(PermissionEnum.EMPLOYEE_DELETE)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.employeesService.remove(id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.EMPLOYEE_UPDATE)
  @Patch(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.employeesService.restore(id);
  }
}
