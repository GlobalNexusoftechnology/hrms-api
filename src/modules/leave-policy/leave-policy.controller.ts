import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeavePolicyService } from './leave-policy.service';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave-policy')
export class LeavePolicyController {
  constructor(private readonly leavePolicyService: LeavePolicyService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Post()
  create(@Body() createLeavePolicyDto: CreateLeavePolicyDto) {
    return this.leavePolicyService.create(createLeavePolicyDto);
  }

  // Need policies for reading rules, so all authenticated can view
  @Get()
  findAll() {
    return this.leavePolicyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leavePolicyService.findOne(id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeavePolicyDto: UpdateLeavePolicyDto,
  ) {
    return this.leavePolicyService.update(id, updateLeavePolicyDto);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leavePolicyService.remove(id);
  }
}
