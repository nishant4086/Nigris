import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDir = './client/app/admin';
walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace flat dark gray borders with glassmorphism
    content = content.replace(/border-gray-700/g, 'border-slate-800');
    content = content.replace(/border-gray-600/g, 'border-slate-700');
    content = content.replace(/border-gray-300/g, 'border-slate-200');
    content = content.replace(/text-gray-500/g, 'text-slate-500');
    content = content.replace(/text-gray-400/g, 'text-slate-400');
    
    // Replace any leftover flat background colors
    content = content.replace(/bg-white dark:bg-\[#191919\]/g, 'bg-white dark:bg-slate-900/50 backdrop-blur-xl');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
