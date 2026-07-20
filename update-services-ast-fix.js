const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths('src/modules/organization/services/*.ts');

project.getSourceFiles().forEach(file => {
  file.getClasses().forEach(cls => {
    cls.getMethods().forEach(method => {
      const name = method.getName();
      if (['create', 'update', 'remove', 'delete', 'addAddress', 'updateAddress'].includes(name) && name !== 'uploadLogo') {
        
        // Ensure userId parameter exists
        if (!method.getParameters().some(p => p.getName() === 'userId')) {
          method.addParameter({ name: 'userId', type: 'string', hasQuestionToken: true });
        }

        // Handle this.repo.create(...) calls
        const createCalls = method.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => c.getExpression().getText().endsWith('.create') && c.getArguments().length === 1);
        
        createCalls.forEach(call => {
          const arg = call.getArguments()[0];
          const text = arg.getText();
          if (arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
            if (!text.includes('createdByUserId')) {
              arg.replaceWithText(text.replace(/}$/, ', createdByUserId: userId }'));
            }
          }
        });

      }
    });
  });
  file.saveSync();
});
console.log('Services re-updated.');
