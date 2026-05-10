import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFiles() {
  const targetDir = './client/app/dashboard';
  walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;
      
      content = content.replace(/dark:bg-\[#202020\]/g, 'dark:bg-slate-800/40');
      content = content.replace(/dark:bg-\[#252525\]/g, 'dark:bg-slate-800/60');
      content = content.replace(/dark:bg-slate-950\/50\/50/g, 'dark:bg-slate-950/30');

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    }
  });
}

processFiles();
