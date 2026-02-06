
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative path for GitHub Pages compatibility
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
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
      output: {
        // 保持导入路径不变，运行时通过 importmap 解析
        paths: {
          'react': 'https://esm.sh/react@18.2.0',
          'react-dom': 'https://esm.sh/react-dom@18.2.0',
          'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
          'react/jsx-runtime': 'https://esm.sh/react@18.2.0/jsx-runtime',
          'react-router-dom': 'https://esm.sh/react-router-dom@6.22.3?deps=react@18.2.0,react-dom@18.2.0',
          'react-markdown': 'https://esm.sh/react-markdown@9.0.1?deps=react@18.2.0',
          'remark-gfm': 'https://esm.sh/remark-gfm@4.0.0',
          'rehype-highlight': 'https://esm.sh/rehype-highlight@7.0.0',
          'lucide-react': 'https://esm.sh/lucide-react@0.363.0?deps=react@18.2.0'
        }
      }
    }
  }
});
