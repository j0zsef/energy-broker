/// <reference types='vitest' />
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => {
  const istanbulPlugins
    = process.env.CYPRESS_COVERAGE === 'true'
      ? [
          (await import('vite-plugin-istanbul')).default({
            cypress: true,
            exclude: ['node_modules', 'cypress', '**/*.cy.ts', '**/*.spec.ts'],
            include: 'src/**/*',
          }),
        ]
      : [];

  return {
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
      nxCopyAssetsPlugin(['*.md']),
      ...istanbulPlugins,
    ],

    preview: {
      host: 'localhost',
      port: 9300,
    },

    root: __dirname,

    server: {
      host: 'localhost',
      port: 9200,
    },

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    test: {
      coverage: {
        provider: 'v8' as const,
        reporter: ['lcov', 'text'],
        reportsDirectory: '../../coverage/apps/frontend',
      },
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      passWithNoTests: true,
      reporters: ['default'],
      watch: false,
    },
  };
});
