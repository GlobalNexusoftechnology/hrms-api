const fs = require('fs');
const path = require('path');

const controllerPath = 'src/modules/organization/organization.controller.ts';
let ctrl = fs.readFileSync(controllerPath, 'utf8');

// Methods to modify
const methods = [
  'updateOrganization', 'uploadLogo',
  'addAddress', 'updateAddress', 'deleteAddress',
  'addTax', 'updateTax',
  'addSettings', 'updateSettings',
  'addBranch', 'updateBranch', 'deleteBranch',
  'addContact', 'updateContact', 'deleteContact',
  'addBankAccount', 'updateBankAccount', 'deleteBankAccount',
  'addDocument', 'updateDocument', 'deleteDocument'
];

methods.forEach(method => {
  // Find method signature
  const regex = new RegExp(`(async ${method}\\([^\\)]+)\\) {`);
  ctrl = ctrl.replace(regex, '$1, @CurrentUser() user: any) {');
  
  // Find service call
  // This looks for return this.somethingService.methodName(...)
  const callRegex = new RegExp(`(return this\\.[a-zA-Z0-9_]+\\.${method.replace(/add/g, 'create').replace(/delete/g, 'remove')}\\([^\\)]+)`);
  // wait, the service method name isn't always direct mapping.
});

fs.writeFileSync(controllerPath, ctrl);
console.log('Done');
