// noinspection ES6ConvertRequireIntoImport
// eslint-disable-next-line no-undef
const fs = require('fs');

// Read manifest.json and package.json
const manifestJson = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const displayName = manifestJson.display_name;
const packageName = packageJson.name;

// Read/create consts.js
const constsTemplate = `const settingsKey = '${packageName}'; // Auto-generated from package.json
const EXTENSION_NAME = '${displayName}'; // Auto-generated from manifest.json

export { settingsKey, EXTENSION_NAME };
`;

fs.writeFileSync('consts.js', constsTemplate);
console.log('Successfully wrote constants to consts.js');
