/// <reference types='vitest' />
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: '../../dist/apps/frontend',
    reportCompressedSize: true,
  },

  cacheDir: '../../node_modules/.vite/apps/frontend',
  envDir: '../../',
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
      target: 'react',
    }),
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
  ],

  preview: {
    host: 'localhost',
    port: 4300,

  },

  root: __dirname,

  server: {
    host: 'localhost',
    port: 4200,
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/apps/frontend',
    },
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    watch: false,
  },
});
