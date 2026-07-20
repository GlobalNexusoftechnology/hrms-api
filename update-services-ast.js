const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths('src/modules/organization/services/*.ts');

const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(file => {
  const classes = file.getClasses();
  classes.forEach(cls => {
    cls.getMethods().forEach(method => {
      const name = method.getName();
      if (['create', 'update', 'remove', 'delete', 'addAddress', 'updateAddress'].includes(name) && name !== 'uploadLogo') {
        
        // Add userId?: string parameter if not present
        if (!method.getParameters().some(p => p.getName() === 'userId')) {
          method.addParameter({ name: 'userId', type: 'string', hasQuestionToken: true });
        }

        // Replace this.repo.create(dto) with this.repo.create({ ...dto, createdByUserId: userId })
        const createCalls = method.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => c.getExpression().getText().endsWith('.create') && c.getArguments().length === 1);
        
        createCalls.forEach(call => {
          const arg = call.getArguments()[0];
          if (arg && arg.getKind() === SyntaxKind.Identifier && arg.getText().includes('Dto')) {
            arg.replaceWithText(`{ ...${arg.getText()}, createdByUserId: userId }`);
          }
        });

        // Replace Object.assign(entity, dto) with Object.assign(entity, dto, { updatedByUserId: userId })
        const assignCalls = method.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => c.getExpression().getText() === 'Object.assign');
        assignCalls.forEach(call => {
           call.addArgument(`{ updatedByUserId: userId }`);
        });

      }
    });
  });
  file.saveSync();
});
console.log('Services updated.');
