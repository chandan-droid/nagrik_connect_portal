import { promises as fs } from 'fs';
import path from 'path';
import { transform } from 'esbuild';

const root = process.cwd();
const srcRoot = path.join(root, 'src');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }
    files.push(full);
  }
  return files;
}

function mapOutFile(file) {
  if (file.endsWith('.tsx')) return file.slice(0, -4) + '.jsx';
  if (file.endsWith('.ts')) return file.slice(0, -3) + '.js';
  return file;
}

function rewriteSpecifiers(code) {
  return code
    .replace(/(from\s+['"][^'"]+)\.tsx(['"])/g, '$1.jsx$2')
    .replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2')
    .replace(/(import\s*\(\s*['"][^'"]+)\.tsx(['"]\s*\))/g, '$1.jsx$2')
    .replace(/(import\s*\(\s*['"][^'"]+)\.ts(['"]\s*\))/g, '$1.js$2');
}

async function run() {
  const allFiles = await walk(srcRoot);
  const tsFiles = allFiles.filter((f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.d.ts'));

  for (const file of tsFiles) {
    const source = await fs.readFile(file, 'utf8');
    const loader = file.endsWith('.tsx') ? 'tsx' : 'ts';

    const result = await transform(source, {
      loader,
      format: 'esm',
      jsx: 'automatic',
      target: 'es2020',
      sourcemap: false,
    });

    const outFile = mapOutFile(file);
    const rewritten = rewriteSpecifiers(result.code);
    await fs.writeFile(outFile, rewritten, 'utf8');
  }

  for (const file of tsFiles) {
    await fs.unlink(file);
  }

  console.log(`Migrated ${tsFiles.length} TypeScript files to JavaScript.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
