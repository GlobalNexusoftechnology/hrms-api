import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationBankAccount } from '../entities/organization-bank-account.entity';
import { CreateOrganizationBankAccountDto } from '../dto/create-organization-bank-account.dto';
import { UpdateOrganizationBankAccountDto } from '../dto/update-organization-bank-account.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationBankAccountService {
  constructor(
    @InjectRepository(OrganizationBankAccount)
    private readonly bankAccountRepo: Repository<OrganizationBankAccount>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateOrganizationBankAccountDto) {
    const org = await this.organizationService.get();
    const bankAccount = this.bankAccountRepo.create({
      ...createDto,
      organizationId: org.id,
    });
    return this.bankAccountRepo.save(bankAccount);
  }

  async update(id: string, updateDto: UpdateOrganizationBankAccountDto) {
    const bankAccount = await this.bankAccountRepo.findOne({ where: { id } });
    if (!bankAccount) throw new NotFoundException('Bank Account not found');

    Object.assign(bankAccount, updateDto);
    return this.bankAccountRepo.save(bankAccount);
  }
  
  async findAll() {
    const org = await this.organizationService.get();
    return this.bankAccountRepo.find({ where: { organizationId: org.id } });
  }

  async remove(id: string) {
    const bankAccount = await this.bankAccountRepo.findOne({ where: { id } });
    if (!bankAccount) throw new NotFoundException('Bank Account not found');
    return this.bankAccountRepo.softRemove(bankAccount);
  }
}
