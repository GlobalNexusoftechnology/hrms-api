import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { EmployeeDocumentsService } from './employee-documents.service';

import { UploadEmployeeDocumentDto } from './dto/upload-employee-document.dto';

@Controller('employees/:id/documents')
export class EmployeeDocumentsController {
  constructor(
    private readonly employeeDocumentsService: EmployeeDocumentsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',

        filename: (req, file, callback) => {
          const tempName = `temp_${Date.now()}${extname(file.originalname)}`;

          callback(null, tempName);
        },
      }),

      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',

          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',

          'application/msword',

          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }

        callback(null, true);
      },

      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadDocument(
    @Param('id', ParseUUIDPipe)
    employeeId: string,

    @Body()
    dto: UploadEmployeeDocumentDto,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.employeeDocumentsService.uploadDocument(
      employeeId,
      dto.documentType,
      file,
    );
  }

  @Get()
  getDocuments(
    @Param('id', ParseUUIDPipe)
    employeeId: string,
  ) {
    return this.employeeDocumentsService.getEmployeeDocuments(employeeId);
  }

  @Delete(':documentId')
  deleteDocument(
    @Param('documentId', ParseUUIDPipe)
    documentId: string,
  ) {
    return this.employeeDocumentsService.deleteDocument(documentId);
  }
}
