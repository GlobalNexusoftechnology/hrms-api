const { Project, SyntaxKind } = require('ts-morph');

const project = new Project();
project.addSourceFilesAtPaths('src/modules/organization/services/*.ts');

project.getSourceFiles().forEach(file => {
  file.getClasses().forEach(cls => {
    cls.getMethods().forEach(method => {
      const name = method.getName();
      if (['create', 'update', 'remove', 'delete', 'addAddress', 'updateAddress'].includes(name) && name !== 'uploadLogo') {
        
        // Add userId parameter
        if (!method.getParameters().some(p => p.getName() === 'userId')) {
          method.addParameter({ name: 'userId', type: 'string', hasQuestionToken: true });
        }

        // Handle repo.create()
        const createCalls = method.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => c.getExpression().getText().endsWith('.create') && c.getArguments().length === 1);
        
        createCalls.forEach(call => {
          const arg = call.getArguments()[0];
          if (arg) {
            if (arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
              // It's an object literal like { ...dto, organizationId: org.id }
              const obj = arg;
              if (!obj.getProperty('createdByUserId')) {
                obj.addPropertyAssignment({ name: 'createdByUserId', initializer: 'userId' });
              }
            } else if (arg.getKind() === SyntaxKind.Identifier) {
              // It's just a variable like createDto
              arg.replaceWithText(`{ ...${arg.getText()}, createdByUserId: userId }`);
            }
          }
        });

        // Handle Object.assign(entity, updateDto)
        const assignCalls = method.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => c.getExpression().getText() === 'Object.assign');
        assignCalls.forEach(call => {
          // Object.assign(entity, dto) => Object.assign(entity, dto, { updatedByUserId: userId })
          call.addArgument(`{ updatedByUserId: userId }`);
        });

      }
    });
  });
  file.saveSync();
});
console.log('Clean AST update complete.');
