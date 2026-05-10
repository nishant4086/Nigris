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
  const targetDir = './client/components';
  walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;
      
      // Replace hardcoded clashing dark backgrounds with glassmorphic ones
      // This blends perfectly with the liquid-shell background
      content = content.replace(/dark:bg-\[#191919\]/g, 'dark:bg-slate-900/50 backdrop-blur-xl');
      
      // Replace the inner darker backgrounds (like search inputs and table headers)
      content = content.replace(/dark:bg-\[#111111\]/g, 'dark:bg-slate-950/50 backdrop-blur-md');
      
      // Fix potential double division/opacity if there was dark:bg-[#111111]/50
      content = content.replace(/dark:bg-slate-950\/50 backdrop-blur-md\/50/g, 'dark:bg-slate-950/30 backdrop-blur-md');
      content = content.replace(/dark:bg-slate-900\/50 backdrop-blur-xl\/50/g, 'dark:bg-slate-900/30 backdrop-blur-xl');

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    }
  });
}

processFiles();
