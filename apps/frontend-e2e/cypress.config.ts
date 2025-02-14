import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      bundler: 'vite',
      ciBaseUrl: 'http://localhost:4300',
      ciWebServerCommand: 'pnpm exec nx run frontend:preview',
      cypressDir: 'src',
      webServerCommands: {
        default: 'pnpm exec nx run frontend:dev',
        production: 'pnpm exec nx run frontend:preview',
      },
    }),
    baseUrl: 'http://localhost:4200',
  },
});
