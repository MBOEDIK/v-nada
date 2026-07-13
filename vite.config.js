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
        orientation: 'portrait'
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'CacheFirst',
            options: { cacheName: 'static-resources' }
          },
          {
            urlPattern: /.*\.wasm.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'mediapipe-models' }
          }
        ]
      }
    })
  ]
});
