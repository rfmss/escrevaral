import baseConfig from './playwright.config'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  ...baseConfig,
  testDir: './tests/evaluation',
  testIgnore: [],
  outputDir: 'test-results-evaluation',
  use: {
    ...baseConfig.use,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2-v-adversarial-results.json' }],
    ['html', { outputFolder: 'playwright-report-evaluation', open: 'never' }],
  ],
})
