const fs = require('fs');

// 1. Fix organization-contact.service.ts
let contactCode = fs.readFileSync('src/modules/organization/services/organization-contact.service.ts', 'utf8');
contactCode = contactCode.replace("import { Repository } from 'typeorm';", "import { Repository, IsNull } from 'typeorm';");
contactCode = contactCode.replace(/async findAll\(\) \{[\s\S]*?return this\.contactRepo\.find\(\{ where: \{ organizationId: org\.id \} \}\);\s*\}/, 
`async findOrgLevel() {
    const org = await this.organizationService.get();
    return this.contactRepo.find({ where: { organizationId: org.id, branchId: IsNull() } });
  }

  async findByBranch(branchId: string) {
    return this.contactRepo.find({ where: { branchId } });
  }`);
fs.writeFileSync('src/modules/organization/services/organization-contact.service.ts', contactCode);

// 2. Fix organization.service.ts
let orgCode = fs.readFileSync('src/modules/organization/services/organization.service.ts', 'utf8');
orgCode = orgCode.replace("async uploadLogo(file: Express.Multer.File): Promise<Organization> {", "async uploadLogo(file: Express.Multer.File, userId?: string): Promise<Organization> {");
orgCode = orgCode.replace(/org\.logoUrl =.*?;\n\s*return this\.organizationRepo\.save\(org\);/, 
`org.logoUrl = \`/uploads/organization/\${file.filename}\`;
    org.updatedByUserId = userId;
    return this.organizationRepo.save(org);`);
fs.writeFileSync('src/modules/organization/services/organization.service.ts', orgCode);

// 3. Fix organization-document.service.ts
let docCode = fs.readFileSync('src/modules/organization/services/organization-document.service.ts', 'utf8');
docCode = docCode.replace("async uploadDocument(body: any, file: Express.Multer.File) {", "async uploadDocument(body: any, file: Express.Multer.File, userId?: string) {");
docCode = docCode.replace(/fileUrl: `\/uploads\/organization\/documents\/\$\{file\.filename\}`,\n\s*\}\);/,
`fileUrl: \`/uploads/organization/\${file.filename}\`,
      createdByUserId: userId,
    });`);
fs.writeFileSync('src/modules/organization/services/organization-document.service.ts', docCode);

console.log('All fixed.');
