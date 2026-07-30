import baseConfig from './playwright.config'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  ...baseConfig,
  testDir: './tests/evaluation',
  testIgnore: [],
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2-v-adversarial-results.json' }],
    ['html', { outputFolder: 'playwright-report-evaluation', open: 'never' }],
  ],
})
