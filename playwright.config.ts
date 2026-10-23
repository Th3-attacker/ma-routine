import { defineConfig, devices } from '@playwright/test'

// Tests de bout en bout sur le build de production, aux largeurs de téléphone 360 et 390 px.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173/ma-routine/' },
  projects: [
    { name: '360px', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } } },
    { name: '390px', use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173/ma-routine/',
    reuseExistingServer: !process.env.CI,
  },
})
