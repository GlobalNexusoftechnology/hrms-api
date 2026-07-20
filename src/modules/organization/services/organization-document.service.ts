import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationDocument } from '../entities/organization-document.entity';
import { CreateOrganizationDocumentDto } from '../dto/create-organization-document.dto';
import { UpdateOrganizationDocumentDto } from '../dto/update-organization-document.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationDocumentService {
  constructor(
    @InjectRepository(OrganizationDocument)
    private readonly documentRepo: Repository<OrganizationDocument>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateOrganizationDocumentDto) {
    const org = await this.organizationService.get();
    const document = this.documentRepo.create({
      ...createDto,
      organizationId: org.id,
    });
    return this.documentRepo.save(document);
  }

  async uploadDocument(body: any, file: Express.Multer.File) {
    const org = await this.organizationService.get();
    
    // Fallbacks if body parsing failed
    const docType = body.documentType || 'OTHER';
    const title = body.title || file.originalname;
    const expiry = body.expiryDate ? new Date(body.expiryDate) : null;
    const branchId = body.branchId || null;

    const document = this.documentRepo.create({
      organizationId: org.id,
      branchId: branchId,
      documentType: docType,
      title: title,
      expiryDate: expiry,
      fileUrl: `/uploads/organization/documents/${file.filename}`,
    });
    
    return this.documentRepo.save(document);
  }

  async update(id: string, updateDto: UpdateOrganizationDocumentDto) {
    const document = await this.documentRepo.findOne({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');

    Object.assign(document, updateDto);
    return this.documentRepo.save(document);
  }
  
  async findAll() {
    const org = await this.organizationService.get();
    return this.documentRepo.find({ where: { organizationId: org.id } });
  }

  async remove(id: string) {
    const document = await this.documentRepo.findOne({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');
    return this.documentRepo.softRemove(document);
  }
}
