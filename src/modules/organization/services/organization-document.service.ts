import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationDocument } from '../entities/organization-document.entity';
import { CreateOrganizationDocumentDto } from '../dto/create-organization-document.dto';
import { UpdateOrganizationDocumentDto } from '../dto/update-organization-document.dto';
import { OrganizationService } from './organization.service';
import { DataScopeService } from '../../../common/services/data-scope.service';

@Injectable()
export class OrganizationDocumentService {
  constructor(
    @InjectRepository(OrganizationDocument)
    private readonly documentRepo: Repository<OrganizationDocument>,
    private readonly organizationService: OrganizationService,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async create(createDto: CreateOrganizationDocumentDto, userId?: string) {
    const org = await this.organizationService.get();
    const document = this.documentRepo.create({
      ...createDto,
      organizationId: org.id,
      createdByUserId: userId,
    });
    return this.documentRepo.save(document);
  }

  async uploadDocument(body: any, file: Express.Multer.File, userId?: string) {
    const org = await this.organizationService.get();

    const docType = body.documentType || 'OTHER';
    const title = body.title || file.originalname;
    const expiry = body.expiryDate ? new Date(body.expiryDate) : null;
    const branchId = body.branchId || null;

    const document = this.documentRepo.create({
      organizationId: org.id,
      branchId,
      documentType: docType,
      title,
      expiryDate: expiry,
      fileUrl: `/uploads/organization/documents/${file.filename}`,
      createdByUserId: userId,
    });
    return this.documentRepo.save(document);
  }

  async update(
    id: string,
    updateDto: UpdateOrganizationDocumentDto,
    userId?: string,
  ) {
    const org = await this.organizationService.get();
    const document = await this.documentRepo.findOne({
      where: { id, organizationId: org.id },
    });
    if (!document) throw new NotFoundException('Document not found');

    Object.assign(document, updateDto, { updatedByUserId: userId });
    return this.documentRepo.save(document);
  }

  async findAll(currentUser?: any) {
    const org = await this.organizationService.get();
    
    const qb = this.documentRepo.createQueryBuilder('document')
      .where('document.organizationId = :orgId', { orgId: org.id });

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'document.branchId',
      });
    }

    return qb.getMany();
  }

  async remove(id: string, userId?: string) {
    const org = await this.organizationService.get();
    const document = await this.documentRepo.findOne({
      where: { id, organizationId: org.id },
    });
    if (!document) throw new NotFoundException('Document not found');
    return this.documentRepo.softRemove(document);
  }
}
