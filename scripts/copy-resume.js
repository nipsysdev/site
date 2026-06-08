const fs = require('node:fs');
const path = require('node:path');

const srcDir = 'external/resume/out';
const destDir = 'public/resume';

// Ensure destination directory exists
fs.mkdirSync(destDir, { recursive: true });

// Copy PDF and HTML files
const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.endsWith('.pdf') || file.endsWith('.html')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied ${file}`);
  }
}
