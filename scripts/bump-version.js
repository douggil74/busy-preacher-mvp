// scripts/bump-version.js
const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'patch';
const envPath = path.join(__dirname, '..', '.env.local');

// Read current version from .env.local
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
  console.error('❌ Could not read .env.local file');
  process.exit(1);
}

const match = envContent.match(/NEXT_PUBLIC_APP_VERSION="(\d+)\.(\d+)"/);

if (!match) {
  console.error('❌ Version not found in .env.local');
  console.log('Expected format: NEXT_PUBLIC_APP_VERSION="3.32"');
  process.exit(1);
}

let [_, major, minor] = match;
major = parseInt(major);
minor = parseInt(minor);

// Bump version based on type
if (type === 'minor') {
  major += 1;
  minor = 0;
} else if (type === 'patch') {
  minor += 1;
} else {
  console.error('❌ Invalid version type. Use "patch" or "minor"');
  process.exit(1);
}

const newVersion = `${major}.${minor}`;

// Update .env.local file
const newContent = envContent.replace(
  /NEXT_PUBLIC_APP_VERSION=".*?"/,
  `NEXT_PUBLIC_APP_VERSION="${newVersion}"`
);

fs.writeFileSync(envPath, newContent);
console.log(`✅ Version bumped from ${match[1]}.${match[2]} → ${newVersion}`);
console.log('📝 Updated .env.local');
console.log('🔄 Restart your dev server to see changes');