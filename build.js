const fs = require('fs');

// Read manifest.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const displayName = manifest.display_name;

// Read index.js
let indexContent = fs.readFileSync('index.js', 'utf8');

// Define the search and replace pattern for EXTENSION_NAME
const searchPattern = /const EXTENSION_NAME = ['"].*?['"];.*$/m;
const replacement = `const EXTENSION_NAME = '${displayName}'; // Auto-generated from manifest.json`;

// Replace the content if EXTENSION_NAME is found
if (indexContent.match(searchPattern)) {
    indexContent = indexContent.replace(searchPattern, replacement);
    fs.writeFileSync('index.js', indexContent);
    console.log('Successfully updated EXTENSION_NAME in index.js');
} else {
    console.warn('Could not find EXTENSION_NAME constant in index.js');
}
