const { Project, SyntaxKind } = require('ts-morph');

const project = new Project();
project.addSourceFilesAtPaths('src/modules/organization/**/*.ts');

const controller = project.getSourceFile('src/modules/organization/organization.controller.ts');

controller.getClasses().forEach(cls => {
  cls.getMethods().forEach(method => {
    const isPostPatchDelete = method.getDecorators().some(d => 
      ['Post', 'Patch', 'Delete'].includes(d.getName())
    );

    if (isPostPatchDelete && method.getName() !== 'createOrganization') { // already did createOrganization
      // Add @CurrentUser() parameter
      method.addParameter({
        name: 'user',
        type: 'any',
        decorators: [{ name: 'CurrentUser', arguments: [] }]
      });

      // Find the return this.service.method(...) statement
      const returnStmt = method.getStatements().find(s => s.getKind() === SyntaxKind.ReturnStatement);
      if (returnStmt) {
        const callExpr = returnStmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
        if (callExpr) {
          callExpr.addArgument('user?.id');
        }
      }
    }
  });
});

controller.saveSync();
console.log('Controller updated.');
