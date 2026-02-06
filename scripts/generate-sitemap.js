
import fs from 'fs';
import path from 'path';
import { POST_IDS } from '../data/posts.ts';

const DOMAIN = 'https://IosefLilianovichDros.github.io'; // 请替换为实际域名

const generateSitemap = () => {
  const lastMod = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${DOMAIN}/#/</loc><lastmod>${lastMod}</lastmod><priority>1.0</priority></url>
  <url><loc>${DOMAIN}/#/tags</loc><lastmod>${lastMod}</lastmod><priority>0.8</priority></url>
  <url><loc>${DOMAIN}/#/portfolio</loc><lastmod>${lastMod}</lastmod><priority>0.8</priority></url>
  <url><loc>${DOMAIN}/#/about</loc><lastmod>${lastMod}</lastmod><priority>0.8</priority></url>`;

  POST_IDS.forEach(id => {
    xml += `
  <url><loc>${DOMAIN}/#/article/${id}</loc><lastmod>${lastMod}</lastmod><priority>0.6</priority></url>`;
  });

  xml += '\n</urlset>';

  const distPath = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), xml);
  console.log('✅ Sitemap generated successfully!');
};

generateSitemap();
