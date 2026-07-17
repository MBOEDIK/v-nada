import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'V-NADA App',
        short_name: 'VNADA',
        description: 'Visual Networked Audio & Digital Articulation',
        theme_color: '#0D47A1',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'CacheFirst',
            options: { cacheName: 'static-resources' }
          },
          {
            urlPattern: /.*\.(wasm|binarypb|data)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'mediapipe-models' }
          },
          {
            urlPattern: /.*\/assets\/index-.*\.(js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'game-components' }
          }
        ]
      }
    })
  ]
});
