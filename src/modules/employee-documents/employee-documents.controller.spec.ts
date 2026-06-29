import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeDocumentsController } from './employee-documents.controller';
import { EmployeeDocumentsService } from './employee-documents.service';
import { DocumentTypeEnum } from '../../common/enums/document-type.enum';

describe('EmployeeDocumentsController', () => {
  let controller: EmployeeDocumentsController;
  let service: EmployeeDocumentsService;

  const mockEmployeeDocumentsService = {
    uploadDocument: jest.fn().mockResolvedValue({ message: 'Success' }),
    getEmployeeDocuments: jest.fn().mockResolvedValue({ data: [] }),
    deleteDocument: jest.fn().mockResolvedValue({ message: 'Deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeDocumentsController],
      providers: [
        {
          provide: EmployeeDocumentsService,
          useValue: mockEmployeeDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeDocumentsController>(
      EmployeeDocumentsController,
    );
    service = module.get<EmployeeDocumentsService>(EmployeeDocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should call service.uploadDocument', async () => {
      const file = {} as Express.Multer.File;
      const dto = { documentType: DocumentTypeEnum.RESUME };
      const result = await controller.uploadDocument('emp-123', dto, file);
      expect(result).toEqual({ message: 'Success' });
      expect(mockEmployeeDocumentsService.uploadDocument).toHaveBeenCalledWith(
        'emp-123',
        DocumentTypeEnum.RESUME,
        file,
      );
    });
  });

  describe('getDocuments', () => {
    it('should call service.getEmployeeDocuments', async () => {
      const result = await controller.getDocuments('emp-123');
      expect(result).toEqual({ data: [] });
      expect(
        mockEmployeeDocumentsService.getEmployeeDocuments,
      ).toHaveBeenCalledWith('emp-123');
    });
  });

  describe('deleteDocument', () => {
    it('should call service.deleteDocument', async () => {
      const result = await controller.deleteDocument('doc-123');
      expect(result).toEqual({ message: 'Deleted' });
      expect(mockEmployeeDocumentsService.deleteDocument).toHaveBeenCalledWith(
        'doc-123',
      );
    });
  });
});
