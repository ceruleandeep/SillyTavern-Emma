const fs = require('fs');

// Read manifest.json and package.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const displayName = manifest.display_name;
const packageName = package.name;

// Read index.js
let indexContent = fs.readFileSync('index.js', 'utf8');

// Define the search and replace patterns
const namePattern = /const EXTENSION_NAME = ['"].*?['"];.*$/m;
const keyPattern = /const settingsKey = ['"].*?['"];.*$/m;

const nameReplacement = `const EXTENSION_NAME = '${displayName}'; // Auto-generated from manifest.json`;
const keyReplacement = `const settingsKey = '${packageName}'; // Auto-generated from package.json`;

// Replace EXTENSION_NAME if found
if (indexContent.match(namePattern)) {
    indexContent = indexContent.replace(namePattern, nameReplacement);
    console.log('Successfully updated EXTENSION_NAME in index.js');
} else {
    console.warn('Could not find EXTENSION_NAME constant in index.js');
}

// Replace settingsKey if found
if (indexContent.match(keyPattern)) {
    indexContent = indexContent.replace(keyPattern, keyReplacement);
    console.log('Successfully updated settingsKey in index.js');
} else {
    console.warn('Could not find settingsKey constant in index.js');
}

// Write the updated content back
fs.writeFileSync('index.js', indexContent);
