import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async findAll() {
        return this.roleRepository.find({
            select: {
                id: true,
                name: true,
            },
            where: {
                isActive: true,
            },
            order: {
                name: 'ASC',
            },
        });
    }
}
