import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeDocument } from './entities/employee-document.entity';
import { IsNull, Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { extname } from 'path';
import { DocumentTypeEnum } from '../../common/enums/document-type.enum';
import * as fs from 'fs';

@Injectable()
export class EmployeeDocumentsService {
  constructor(
    @InjectRepository(EmployeeDocument)
    private readonly employeeDocumentRepository: Repository<EmployeeDocument>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async uploadDocument(
    employeeId: string,

    documentType: DocumentTypeEnum,

    file: Express.Multer.File,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,

        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const extension = extname(file.originalname);

    const newFileName = `${employee.employeeCode}_${documentType}_${Date.now()}${extension}`;

    const oldPath = file.path;

    const newPath = `uploads/documents/${newFileName}`;

    fs.renameSync(oldPath, newPath);

    // SINGLE DOCUMENT TYPES
    const singleDocumentTypes = [
      DocumentTypeEnum.PAN,
      DocumentTypeEnum.AADHAAR,
      DocumentTypeEnum.RESUME,
      DocumentTypeEnum.OFFER_LETTER,
      DocumentTypeEnum.DEGREE,
      DocumentTypeEnum.EXPERIENCE_LETTER,
    ];

    if (singleDocumentTypes.includes(documentType)) {
      const existingDocument = await this.employeeDocumentRepository.findOne({
        where: {
          employeeId,
          documentType,
          deletedAt: IsNull(),
        },
      });

      if (existingDocument) {
        const existingFilePath = existingDocument.fileUrl.replace(
          '/uploads/',
          'uploads/',
        );

        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }

        await this.employeeDocumentRepository.softDelete(existingDocument.id);
      }
    }

    const document = this.employeeDocumentRepository.create({
      employeeId,

      documentType,

      fileName: newFileName,

      fileUrl: `/uploads/documents/${newFileName}`,

      mimeType: file.mimetype,

      fileSize: file.size,
    });

    await this.employeeDocumentRepository.save(document);

    return {
      message: 'Document uploaded successfully',

      data: document,
    };
  }

  async getEmployeeDocuments(employeeId: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,

        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const documents = await this.employeeDocumentRepository.find({
      where: {
        employeeId,

        deletedAt: IsNull(),
      },

      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: documents,
    };
  }

  async deleteDocument(documentId: string) {
    const document = await this.employeeDocumentRepository.findOne({
      where: {
        id: documentId,

        deletedAt: IsNull(),
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = document.fileUrl.replace('/uploads/', 'uploads/');

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.employeeDocumentRepository.softDelete(documentId);

    return {
      message: 'Document deleted successfully',
    };
  }
}
