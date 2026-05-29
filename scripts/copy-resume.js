const fs = require('fs');
const path = require('path');

const srcDir = 'external/resume/out';
const destDir = 'public/resume';

// Ensure destination directory exists
fs.mkdirSync(destDir, { recursive: true });

// Copy only PDF files
const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.endsWith('.pdf')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied ${file}`);
  }
}
