import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://your-domain.com',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
  },
  vite: {
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@content': path.resolve(__dirname, 'src/content'),
      },
    },
  },
});
