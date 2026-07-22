import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveLedgerDto } from './dto/create-leave-ledger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveLedger } from './entities/leave-ledger.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LeaveLedgerService {
  constructor(
    @InjectRepository(LeaveLedger)
    private readonly leaveLedgerRepo: Repository<LeaveLedger>,
  ) {}

  async create(createLeaveLedgerDto: CreateLeaveLedgerDto) {
    const entry = this.leaveLedgerRepo.create(createLeaveLedgerDto);
    return this.leaveLedgerRepo.save(entry);
  }

  findAllByEmployee(employeeId: string, year?: number) {
    const qb = this.leaveLedgerRepo.createQueryBuilder('ledger')
      .where('ledger.employee_id = :employeeId', { employeeId })
      .leftJoinAndSelect('ledger.leaveType', 'leaveType')
      .orderBy('ledger.createdAt', 'DESC');

    if (year) {
      qb.andWhere('EXTRACT(YEAR FROM ledger.created_at) = :year', { year });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const entry = await this.leaveLedgerRepo.findOne({
      where: { id },
      relations: { leaveType: true },
    });

    if (!entry) {
      throw new NotFoundException('Leave ledger entry not found');
    }

    return entry;
  }
}
