import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 清理 dist 目录
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// 构建 TypeScript 文件，但保持导入为外部
await esbuild.build({
  entryPoints: [path.join(rootDir, 'index.tsx')],
  bundle: true,
  format: 'esm',
  outfile: path.join(distDir, 'index.js'),
  external: [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    'react-router-dom',
    'react-markdown',
    'remark-gfm',
    'rehype-highlight',
    'lucide-react'
  ],
  jsx: 'automatic',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts'
  },
  minify: true,
  sourcemap: false
});

// 复制 index.html 并修改 script 引用
let indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

// 替换所有可能的 index.tsx 引用
indexHtml = indexHtml.replace(/src="\.\/index\.tsx"/g, 'src="./index.js"');
indexHtml = indexHtml.replace(/src="\/index\.tsx"/g, 'src="/index.js"');

// 清理 importmap 中不需要的条目（构建工具相关）
indexHtml = indexHtml.replace(
  /"vite":\s*"[^"]+",?\s*\n?/g,
  ''
).replace(
  /"@vitejs\/plugin-react":\s*"[^"]+",?\s*\n?/g,
  ''
).replace(
  /"fs":\s*"[^"]+",?\s*\n?/g,
  ''
).replace(
  /"path":\s*"[^"]+",?\s*\n?/g,
  ''
).replace(
  /"react-dom\/":\s*"[^"]+",?\s*\n?/g,
  ''
).replace(
  /"react\/":\s*"[^"]+",?\s*\n?/g,
  ''
);

// 清理多余的逗号和空行
indexHtml = indexHtml.replace(/,(\s*)\n(\s*)}/g, '\n$2}');
indexHtml = indexHtml.replace(/,(\s*),/g, ',');

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

// 复制 public 目录
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// 复制 metadata.json
const metadataPath = path.join(rootDir, 'metadata.json');
if (fs.existsSync(metadataPath)) {
  fs.copyFileSync(metadataPath, path.join(distDir, 'metadata.json'));
}

// 创建 .nojekyll 文件，确保 GitHub Pages 不处理文件
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

console.log('✓ Build completed successfully!');
console.log('✓ Output directory: dist/');
console.log('✓ Entry point: index.html -> index.js');
console.log('');
console.log('Files in dist:');
const distFiles = fs.readdirSync(distDir);
distFiles.forEach(file => console.log(`  - ${file}`));

