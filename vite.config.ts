import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { churchPhotos, churchVideos } from './src/data/churchMedia';

const SITE_ORIGIN = 'https://www.anointedworshipcenter.com';

/**
 * Publishes the Gallery's church photos and videos as /gallery-feed.json so other AWC
 * apps (AWC Connect) show exactly what the website shows. Leah's Pixieset photos are
 * live via /api/gallery/pixieset and aren't duplicated here.
 */
function galleryFeed(): Plugin {
  const abs = (u: string) => (u && u.startsWith('/') ? `${SITE_ORIGIN}${u}` : u);
  return {
    name: 'awc-gallery-feed',
    apply: 'build',
    generateBundle() {
      const toItem = (i: (typeof churchPhotos)[number]) => ({
        id: i.id,
        type: i.type,
        url: abs(i.url),
        thumbnail: abs(i.thumbnail),
        title: i.title,
        category: i.category,
        description: i.description,
        width: i.width,
        height: i.height,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'gallery-feed.json',
        source: JSON.stringify({
          v: 1,
          generatedAt: new Date().toISOString(),
          photos: churchPhotos.map(toItem),
          videos: churchVideos.map(toItem),
        }),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
        '/vault': {
          target: 'https://awc-vault.vercel.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vault/, ''),
        },
      },
    },
    plugins: [react(), galleryFeed()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
