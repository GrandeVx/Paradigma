#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);

// Percorsi delle cartelle
const SVG_DIR = path.resolve(__dirname, '../public/icons');
const COMPONENT_DIR = path.resolve(__dirname, '../components/ui/svg-icons');

// Verifica se la cartella di output esiste, altrimenti la crea
async function ensureDirectoryExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

// Converte kebab-case a PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Genera il template del componente React
function generateComponentTemplate(svgContent, iconName) {
  // Estrarre il viewBox dall'SVG originale
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 40 40';

  // Rimuove le prime e ultime righe dell'SVG (tag <svg> </svg>) e indenta correttamente
  let paths = svgContent
    .replace(/<svg[^>]*>|<\/svg>/g, '')
    .trim()
    .split('\n')
    .map(line => `      ${line.trim()}`)
    .join('\n');

  // Sostituisce fill="black" con fill={fillColor} per supportare il cambio colore
  paths = paths.replace(/fill="([^"]+)"/g, 'fill={fillColor}');

  return `import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const ${iconName}Icon: React.FC<IconSvgProps> = ({ 
  color = "currentColor", 
  size = 24, 
  ...props 
}) => {
  const fillColor = resolveColor(color);
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="${viewBox}"
      fill="none"
      {...props}
    >
${paths}
    </Svg>
  );
};

${iconName}Icon.displayName = "${iconName}Icon";`;
}

// Genera l'indice delle esportazioni
async function generateIndex(iconNames) {
  const exports = iconNames.map(name => `export { ${name}Icon } from './${name.toLowerCase()}-icon';`).join('\n');
  const content = `${exports}\nexport type { IconSvgProps } from './base-icon';`;

  await writeFile(path.join(COMPONENT_DIR, 'index.ts'), content, 'utf8');
  console.log('Created index.ts file');
}

// Funzione principale
async function main() {
  try {
    await ensureDirectoryExists(COMPONENT_DIR);

    // Leggi tutti i file SVG nella directory
    const files = await readdir(SVG_DIR);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    const iconNames = [];

    console.log(`Found ${svgFiles.length} SVG files`);

    // Genera un componente per ogni file SVG
    for (const file of svgFiles) {
      const svgContent = await readFile(path.join(SVG_DIR, file), 'utf8');
      const baseName = path.basename(file, '.svg');
      const pascalCaseName = toPascalCase(baseName);

      iconNames.push(pascalCaseName);

      const componentContent = generateComponentTemplate(svgContent, pascalCaseName);
      const componentPath = path.join(COMPONENT_DIR, `${baseName}-icon.tsx`);

      await writeFile(componentPath, componentContent, 'utf8');
      console.log(`Created component: ${baseName}-icon.tsx`);
    }

    // Genera il file di indice
    await generateIndex(iconNames);

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main(); 