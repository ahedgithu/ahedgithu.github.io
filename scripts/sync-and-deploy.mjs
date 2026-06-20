import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const topicName = args[0] || 'Updates';

const appDir = path.resolve('.');
const srcMcqPath = path.join(appDir, 'src', 'mcqs.js');
const pubMcqPath = path.join(appDir, 'public', 'src', 'mcqs.js');
const htmlPath = path.join(appDir, 'index.html');

console.log('=== MCQ Sync and Deploy Tool ===');

try {
  const srcContent = fs.readFileSync(srcMcqPath, 'utf8');
  fs.writeFileSync(pubMcqPath, srcContent, 'utf8');
  console.log('✓ Synchronized src/mcqs.js to public/src/mcqs.js');
} catch (err) {
  console.error('Error syncing mcqs.js files:', err.message);
  process.exit(1);
}

let newVersion = '';
try {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSuffix = Math.floor(100 + Math.random() * 900);
  newVersion = `${dateStr}-${randSuffix}`;

  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cacheBustRegex = /(\/src\/mcqs\.js\?v=)([^"]+)/g;
  
  if (cacheBustRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(cacheBustRegex, `$1${newVersion}`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`✓ Updated cache-buster in index.html to: ${newVersion}`);
  } else {
    console.warn('⚠ Could not find mcqs.js script tag in index.html to update cache-buster!');
  }
} catch (err) {
  console.error('Error updating index.html:', err.message);
  process.exit(1);
}

try {
  console.log('Running npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✓ Build succeeded.');
} catch (err) {
  console.error('Error running build:', err.message);
  process.exit(1);
}

try {
  console.log('Staging files...');
  execSync(`git add src/mcqs.js public/src/mcqs.js index.html`, { stdio: 'inherit' });
  
  const commitMsg = `Add MCQs for ${topicName}`;
  console.log(`Committing changes: "${commitMsg}"...`);
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  
  console.log('Pushing to origin live-ainshams:main...');
  execSync('git push origin live-ainshams:main', { stdio: 'inherit' });
  console.log('✓ Successfully deployed!');
} catch (err) {
  console.error('Error during git deployment:', err.message);
  process.exit(1);
}
