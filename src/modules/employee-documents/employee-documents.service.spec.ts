import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeDocumentsService } from './employee-documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeDocument } from './entities/employee-document.entity';
import { Employee } from '../employees/entities/employee.entity';
import { DocumentTypeEnum } from '../../common/enums/document-type.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('fs', () => ({
  renameSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
}));

describe('EmployeeDocumentsService', () => {
  let service: EmployeeDocumentsService;
  let documentRepo: any;
  let employeeRepo: any;

  const mockEmployee = {
    id: 'emp-123',
    employeeCode: 'EMP-001',
  };

  const mockDocument = {
    id: 'doc-123',
    employeeId: 'emp-123',
    documentType: DocumentTypeEnum.RESUME,
    fileName: 'resume.pdf',
    fileUrl: '/uploads/documents/resume.pdf',
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn().mockReturnValue(mockDocument),
    save: jest.fn().mockResolvedValue(mockDocument),
    find: jest.fn(),
    softDelete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeDocumentsService,
        {
          provide: getRepositoryToken(EmployeeDocument),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<EmployeeDocumentsService>(EmployeeDocumentsService);
    documentRepo = module.get(getRepositoryToken(EmployeeDocument));
    employeeRepo = module.get(getRepositoryToken(Employee));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    const file = {
      originalname: 'resume.pdf',
      path: 'temp/resume.pdf',
      mimetype: 'application/pdf',
      size: 1000,
    } as Express.Multer.File;

    it('should successfully upload and rename document', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      documentRepo.findOne.mockResolvedValue(null);

      const result = await service.uploadDocument(
        'emp-123',
        DocumentTypeEnum.RESUME,
        file,
      );
      expect(result.data).toEqual(mockDocument);
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.uploadDocument('emp-123', DocumentTypeEnum.RESUME, file),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if file is missing', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      await expect(
        service.uploadDocument('emp-123', DocumentTypeEnum.RESUME, null as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteDocument', () => {
    it('should delete file and soft delete record from database', async () => {
      documentRepo.findOne.mockResolvedValue(mockDocument);
      documentRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteDocument('doc-123');
      expect(result).toEqual({ message: 'Document deleted successfully' });
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(documentRepo.softDelete).toHaveBeenCalledWith('doc-123');
    });

    it('should throw NotFoundException if document not found', async () => {
      documentRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteDocument('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
