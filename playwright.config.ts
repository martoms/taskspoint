import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: false,
  reporter: 'list',
  retries: 0,
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4200',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm start -- --port 4200',
    reuseExistingServer: true,
    timeout: 120_000,
    url: 'http://127.0.0.1:4200',
  },
  workers: 1,
});
