import { Controller, Get, Post, Patch, Delete, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';

import { OrganizationService } from './services/organization.service';
import { OrganizationAddressService } from './services/organization-address.service';
import { OrganizationTaxService } from './services/organization-tax.service';
import { OrganizationSettingsService } from './services/organization-settings.service';
import { BranchService } from './services/branch.service';
import { OrganizationContactService } from './services/organization-contact.service';
import { OrganizationBankAccountService } from './services/organization-bank-account.service';
import { OrganizationDocumentService } from './services/organization-document.service';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateOrganizationAddressDto } from './dto/create-organization-address.dto';
import { UpdateOrganizationAddressDto } from './dto/update-organization-address.dto';
import { CreateOrganizationTaxDto } from './dto/create-organization-tax.dto';
import { UpdateOrganizationTaxDto } from './dto/update-organization-tax.dto';
import { CreateOrganizationSettingsDto } from './dto/create-organization-settings.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';

import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { CreateOrganizationContactDto } from './dto/create-organization-contact.dto';
import { UpdateOrganizationContactDto } from './dto/update-organization-contact.dto';
import { CreateOrganizationBankAccountDto } from './dto/create-organization-bank-account.dto';
import { UpdateOrganizationBankAccountDto } from './dto/update-organization-bank-account.dto';
import { CreateOrganizationDocumentDto } from './dto/create-organization-document.dto';
import { UpdateOrganizationDocumentDto } from './dto/update-organization-document.dto';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly addressService: OrganizationAddressService,
    private readonly taxService: OrganizationTaxService,
    private readonly settingsService: OrganizationSettingsService,
    private readonly branchService: BranchService,
    private readonly contactService: OrganizationContactService,
    private readonly bankAccountService: OrganizationBankAccountService,
    private readonly documentService: OrganizationDocumentService,
  ) {}

  // --- Organization Core ---
  
  @Get()
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get the singleton organization profile' })
  async getOrganization() {
    return this.organizationService.get();
  }

  @Post()
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Initialize the singleton organization (Internal Bootstrap Use)' })
  async createOrganization(@Body() createDto: CreateOrganizationDto) {
    return this.organizationService.create(createDto);
  }

  @Patch()
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update the organization profile' })
  async updateOrganization(@Body() updateDto: UpdateOrganizationDto) {
    return this.organizationService.update(updateDto);
  }

  @Post('logo')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Upload organization logo' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/organization',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.organizationService.uploadLogo(file);
  }

  // --- Address ---

  @Post('address')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Add an address to the organization' })
  async createAddress(@Body() createDto: CreateOrganizationAddressDto) {
    return this.addressService.create(createDto);
  }

  @Patch('address/:id')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update a specific address' })
  async updateAddress(@Param('id') id: string, @Body() updateDto: UpdateOrganizationAddressDto) {
    return this.addressService.update(id, updateDto);
  }

  // --- Tax ---

  @Post('tax')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Set the organization tax profile' })
  async createTax(@Body() createDto: CreateOrganizationTaxDto) {
    return this.taxService.create(createDto);
  }

  @Patch('tax')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update the organization tax profile' })
  async updateTax(@Body() updateDto: UpdateOrganizationTaxDto) {
    return this.taxService.update(updateDto);
  }

  // --- Settings ---

  @Post('settings')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Set the organization settings' })
  async createSettings(@Body() createDto: CreateOrganizationSettingsDto) {
    return this.settingsService.create(createDto);
  }

  @Patch('settings')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update the organization settings' })
  async updateSettings(@Body() updateDto: UpdateOrganizationSettingsDto) {
    return this.settingsService.update(updateDto);
  }

  // --- Branch ---

  @Get('branch')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get all branches' })
  async getBranches() {
    return this.branchService.findAll();
  }

  @Post('branch')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Add a new branch' })
  async createBranch(@Body() createDto: CreateBranchDto) {
    return this.branchService.create(createDto);
  }

  @Patch('branch/:id')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update a specific branch' })
  async updateBranch(@Param('id') id: string, @Body() updateDto: UpdateBranchDto) {
    return this.branchService.update(id, updateDto);
  }

  // --- Contact ---

  @Get('contact')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get all organization contacts' })
  async getContacts() {
    return this.contactService.findAll();
  }

  @Post('contact')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Add a new contact' })
  async createContact(@Body() createDto: CreateOrganizationContactDto) {
    return this.contactService.create(createDto);
  }

  @Patch('contact/:id')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update a contact' })
  async updateContact(@Param('id') id: string, @Body() updateDto: UpdateOrganizationContactDto) {
    return this.contactService.update(id, updateDto);
  }

  // --- Bank Account ---

  @Get('bank-account')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get all organization bank accounts' })
  async getBankAccounts() {
    return this.bankAccountService.findAll();
  }

  @Post('bank-account')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Add a new bank account' })
  async createBankAccount(@Body() createDto: CreateOrganizationBankAccountDto) {
    return this.bankAccountService.create(createDto);
  }

  @Patch('bank-account/:id')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update a bank account' })
  async updateBankAccount(@Param('id') id: string, @Body() updateDto: UpdateOrganizationBankAccountDto) {
    return this.bankAccountService.update(id, updateDto);
  }

  // --- Document ---

  @Get('document')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get all organization documents' })
  async getDocuments() {
    return this.documentService.findAll();
  }

  @Post('document')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Add a new document' })
  async createDocument(@Body() createDto: CreateOrganizationDocumentDto) {
    return this.documentService.create(createDto);
  }

  @Post('document/upload')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Upload an organization document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentType: { type: 'string' },
        title: { type: 'string' },
        expiryDate: { type: 'string', format: 'date' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/organization/documents',
        filename: (req, file, callback) => {
          const tempName = `org_doc_${Date.now()}${extname(file.originalname)}`;
          callback(null, tempName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.documentService.uploadDocument(body, file);
  }

  @Patch('document/:id')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update a document' })
  async updateDocument(@Param('id') id: string, @Body() updateDto: UpdateOrganizationDocumentDto) {
    return this.documentService.update(id, updateDto);
  }

  @Delete('document/:id')
  @Public()
  @Permissions(PermissionEnum.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
