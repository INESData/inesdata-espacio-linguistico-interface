import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'tests/cypress/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:8090',
    supportFile: 'tests/cypress/support/e2e.ts',
    fixturesFolder: 'tests/cypress/output/fixtures',
    screenshotsFolder: 'tests/cypress/output/screenshots',
    videosFolder: 'tests/cypress/output/videos',
    downloadsFolder: 'tests/cypress/output/downloads',
    video: false,
    chromeWebSecurity: false,
  },
});
