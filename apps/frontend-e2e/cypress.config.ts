import codeCoverageTask from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      bundler: 'vite',
      ciBaseUrl: 'http://localhost:4300',
      ciWebServerCommand: 'CYPRESS_COVERAGE=true pnpm exec nx run frontend:preview',
      cypressDir: 'src',
      webServerCommands: {
        default: 'CYPRESS_COVERAGE=true pnpm exec nx run frontend:dev',
        production: 'CYPRESS_COVERAGE=true pnpm exec nx run frontend:preview',
      },
    }),
    baseUrl: 'http://localhost:9200',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
});
