import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationBankAccount } from '../entities/organization-bank-account.entity';
import { CreateOrganizationBankAccountDto } from '../dto/create-organization-bank-account.dto';
import { UpdateOrganizationBankAccountDto } from '../dto/update-organization-bank-account.dto';
import { OrganizationService } from './organization.service';
import { DataScopeService } from '../../../common/services/data-scope.service';

@Injectable()
export class OrganizationBankAccountService {
  constructor(
    @InjectRepository(OrganizationBankAccount)
    private readonly bankAccountRepo: Repository<OrganizationBankAccount>,
    private readonly organizationService: OrganizationService,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async create(createDto: CreateOrganizationBankAccountDto, userId?: string) {
    const org = await this.organizationService.get();
    const bankAccount = this.bankAccountRepo.create({
      ...createDto,
      organizationId: org.id,
      createdByUserId: userId,
    });
    return this.bankAccountRepo.save(bankAccount);
  }

  async update(
    id: string,
    updateDto: UpdateOrganizationBankAccountDto,
    userId?: string,
  ) {
    const org = await this.organizationService.get();
    const bankAccount = await this.bankAccountRepo.findOne({
      where: { id, organizationId: org.id },
    });
    if (!bankAccount) throw new NotFoundException('Bank Account not found');

    Object.assign(bankAccount, updateDto, { updatedByUserId: userId });
    return this.bankAccountRepo.save(bankAccount);
  }

  async findAll(currentUser?: any) {
    const org = await this.organizationService.get();
    
    const qb = this.bankAccountRepo.createQueryBuilder('bankAccount')
      .where('bankAccount.organizationId = :orgId', { orgId: org.id });

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'bankAccount.branchId',
      });
    }

    return qb.getMany();
  }

  async remove(id: string, userId?: string) {
    const org = await this.organizationService.get();
    const bankAccount = await this.bankAccountRepo.findOne({
      where: { id, organizationId: org.id },
    });
    if (!bankAccount) throw new NotFoundException('Bank Account not found');
    return this.bankAccountRepo.softRemove(bankAccount);
  }
}
