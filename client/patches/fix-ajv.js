const fs = require('fs');
const path = require('path');

const targets = [
  'node_modules/fork-ts-checker-webpack-plugin/node_modules/ajv-keywords/keywords/_formatLimit.js',
  'node_modules/react-dev-utils/node_modules/ajv-keywords/keywords/_formatLimit.js',
];

targets.forEach(target => {
  const filePath = path.join(__dirname, '..', target);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      'var formats = ajv._formats;',
      'var formats = ajv._formats || {};'
    );
    fs.writeFileSync(filePath, content);
    console.log('Patched:', target);
  }
});
