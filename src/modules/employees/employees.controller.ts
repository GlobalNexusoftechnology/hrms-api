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
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Permissions(PermissionEnum.EMPLOYEE_CREATE)
  @Post()
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: any) {
    return this.employeesService.create(dto, user);
  }

  // @Public()
  // @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Get()
  findAll(
    @Query()
    query: GetEmployeesDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.employeesService.findAll(query, currentUser);
  }

  @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.employeesService.findOne(id, currentUser);
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    if (user.role?.name === RoleEnum.EMPLOYEE && user.id !== id) {
      throw new ForbiddenException('You can only update your own details.');
    }
    return this.employeesService.update(id, dto, user);
  }

  @Permissions('role.assign')
  @Patch(':id/role')
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.employeesService.assignRole(id, dto.roleId, user);
  }

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
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
    @CurrentUser() user: any,
  ) {
    if (user.role?.name === RoleEnum.EMPLOYEE && user.id !== id) {
      throw new ForbiddenException(
        'You can only update your own profile photo.',
      );
    }
    return this.employeesService.uploadProfilePhoto(id, file);
  }

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.EMPLOYEE_DELETE)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() user: any,
  ) {
    return this.employeesService.remove(id, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionEnum.EMPLOYEE_UPDATE)
  @Patch(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.employeesService.restore(id);
  }
}
