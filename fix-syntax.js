const fs = require('fs');
const glob = require('glob'); // wait, glob might not be installed. Let's just use readdir.

const dir = 'src/modules/organization/services';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const p = dir + '/' + f;
  let code = fs.readFileSync(p, 'utf8');
  
  // Fix the syntax error: \n        , createdByUserId: userId }
  code = code.replace(/,\s*,\s*createdByUserId: userId/g, ', createdByUserId: userId');
  
  // Actually, in the error it looks like:
  // organizationId: org.id,
  // , createdByUserId: userId });
  code = code.replace(/,\s*,\s*createdByUserId/g, ', createdByUserId');
  code = code.replace(/,\n\s*,\s*createdByUserId/g, ',\n      createdByUserId');

  // Fix where it missed the first time for object literals without syntax error
  // If there's an object literal being passed to create:
  code = code.replace(/this\.([a-zA-Z0-9_]+)\.create\(\{\n\s*\.\.\.([a-zA-Z0-9_]+),\n\s*organizationId: (org\.id|branch\.organizationId),\n\s*\}\)/g, 
    'this.$1.create({\n      ...$2,\n      organizationId: $3,\n      createdByUserId: userId\n    })');

  code = code.replace(/this\.([a-zA-Z0-9_]+)\.create\(\{\n\s*\.\.\.([a-zA-Z0-9_]+),\n\s*organizationId: (org\.id|branch\.organizationId)\n\s*\}\)/g, 
    'this.$1.create({\n      ...$2,\n      organizationId: $3,\n      createdByUserId: userId\n    })');

  fs.writeFileSync(p, code);
});

console.log('Syntax errors fixed.');
