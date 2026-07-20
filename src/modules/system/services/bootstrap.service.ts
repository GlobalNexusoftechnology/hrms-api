import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BootstrapSystemDto } from '../dto/bootstrap.dto';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationAddress } from '../../organization/entities/organization-address.entity';
import { OrganizationTax } from '../../organization/entities/organization-tax.entity';
import { OrganizationSettings } from '../../organization/entities/organization-settings.entity';
import { Branch } from '../../organization/entities/branch.entity';
// Note: Role and User entities will be integrated fully in Phase 2.2
// import { Role } from '../../rbac/entities/role.entity';
// import { User } from '../../users/entities/user.entity';

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly dataSource: DataSource) {}

  async bootstrap(dto: BootstrapSystemDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Check if already bootstrapped
    const existingOrg = await queryRunner.manager.findOne(Organization, { where: {} });
    if (existingOrg) {
      await queryRunner.release();
      throw new BadRequestException('System is already bootstrapped. This is a one-time initialization mechanism.');
    }

    await queryRunner.startTransaction();

    try {
      this.logger.log('Starting System Bootstrap Transaction...');

      // 1. Create Organization
      const org = queryRunner.manager.create(Organization, dto.organization);
      await queryRunner.manager.save(org);

      // 2. Create Address
      const address = queryRunner.manager.create(OrganizationAddress, {
        ...dto.address,
        organizationId: org.id,
      });
      await queryRunner.manager.save(address);

      // 3. Create Tax Profile
      const tax = queryRunner.manager.create(OrganizationTax, {
        ...dto.tax,
        organizationId: org.id,
      });
      await queryRunner.manager.save(tax);

      // 4. Create Settings
      const settings = queryRunner.manager.create(OrganizationSettings, {
        ...dto.settings,
        organizationId: org.id,
      });
      await queryRunner.manager.save(settings);

      // 5. Create Head Office Branch
      const branch = queryRunner.manager.create(Branch, {
        ...dto.headOffice,
        organizationId: org.id,
        isHeadOffice: true,
      });
      await queryRunner.manager.save(branch);

      // 6. Stub for Chairman Role & User (To be implemented in Phase 2.2)
      this.logger.log(`Bootstrap requires Admin User: ${dto.adminUser.email}. Storing temporarily or delegating to RBAC Phase 2.2.`);

      await queryRunner.commitTransaction();
      this.logger.log('System Bootstrap completed successfully.');
      
      return {
        message: 'System bootstrapped successfully',
        organization: org,
        headOffice: branch,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Bootstrap failed, rolling back transaction', err);
      throw new BadRequestException(`Bootstrap failed: ${(err as Error).message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
