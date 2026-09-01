'use strict';
const fs = require('fs');
const path = require('path');

const nodeModules = path.join(__dirname, '..', 'node_modules');

function findAndPatch(dir) {
  const target = path.join(dir, 'ajv-keywords', 'keywords', '_formatLimit.js');
  if (fs.existsSync(target)) {
    let content = fs.readFileSync(target, 'utf8');
    if (content.includes('var formats = ajv._formats;')) {
      content = content.replace(
        'var formats = ajv._formats;',
        'var formats = ajv._formats || {};'
      );
      fs.writeFileSync(target, content);
      console.log('Patched:', target);
    }
  }
}

// Walk node_modules one level deep to find nested ajv-keywords
if (fs.existsSync(nodeModules)) {
  fs.readdirSync(nodeModules).forEach(pkg => {
    const pkgDir = path.join(nodeModules, pkg);
    findAndPatch(pkgDir);
    // check nested node_modules
    const nested = path.join(pkgDir, 'node_modules');
    if (fs.existsSync(nested)) {
      fs.readdirSync(nested).forEach(subpkg => {
        findAndPatch(path.join(nested, subpkg));
      });
    }
  });
}

console.log('Patch complete.');
