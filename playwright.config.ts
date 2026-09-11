import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/ux',
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8097',
    viewport: { width: 390, height: 700 },
    isMobile: true, hasTouch: true,
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-mobile', use: { browserName: 'chromium' } },
    { name: 'webkit-mobile', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'CI=1 npm run web -- --port 8097',
    url: 'http://127.0.0.1:8097', timeout: 120000,
    reuseExistingServer: false,
  },
});
