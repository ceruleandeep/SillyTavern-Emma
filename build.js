const fs = require('fs');
const path = require('path');

// Read manifest.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const displayName = manifest.display_name;

// Read index.js
let indexContent = fs.readFileSync('index.js', 'utf8');

// Define the search and replace patterns
const searchPattern = /const settingsKey = ['"]cd-ExtensionManagerManager['"];/;
const replacement = `const settingsKey = 'cd-ExtensionManagerManager';\nconst EXTENSION_NAME = '${displayName}'; // Auto-generated from manifest.json`;

// Replace the content
indexContent = indexContent.replace(searchPattern, replacement);

// Write back to index.js
fs.writeFileSync('index.js', indexContent);

console.log('Successfully updated EXTENSION_NAME in index.js');
