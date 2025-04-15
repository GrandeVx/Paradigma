import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';
import nodemon from 'nodemon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Log dei percorsi per debug
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);

const sourceFile = join(rootDir, 'packages/styles/src/styles/global.css');
const targetFile = join(rootDir, 'apps/mobile/global.css');

console.log('Source file:', sourceFile);
console.log('Target file:', targetFile);

// Verifica che il file sorgente esista
if (!fs.existsSync(sourceFile)) {
  console.error('Source file does not exist:', sourceFile);
  process.exit(1);
}

// Assicuriamoci che la directory di destinazione esista
const targetDir = dirname(targetFile);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copia iniziale
try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log('Initial styles copied successfully');
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}

nodemon({
  watch: dirname(sourceFile),
  ext: 'css',
  verbose: true
})
  .on('start', () => {
    console.log('Watch started');
  })
  .on('restart', () => {
    try {
      fs.copyFileSync(sourceFile, targetFile);
      console.log('Styles synchronized');
    } catch (error) {
      console.error('Error syncing styles:', error);
    }
  })
  .on('quit', () => {
    console.log('Watch ended');
    process.exit();
  })
  .on('error', (error) => {
    console.error('Nodemon error:', error);
  }); 