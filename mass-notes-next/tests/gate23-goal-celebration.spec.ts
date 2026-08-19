import { expect, test } from '@playwright/test'

test('atingir a meta celebra uma vez e continuar escrevendo não repete a celebração', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __escrevaralGoalCelebrations?: number }).__escrevaralGoalCelebrations = 0
    window.addEventListener('escrevaral:writing-goal-achieved', () => {
      const target = window as Window & { __escrevaralGoalCelebrations?: number }
      target.__escrevaralGoalCelebrations = (target.__escrevaralGoalCelebrations ?? 0) + 1
    })
  })

  await page.goto('/')
  await page.setViewportSize({ width: 1366, height: 768 })
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()

  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Metas', exact: true }).click()
  const input = page.getByLabel('Meta diária de palavras')
  await input.fill('5')
  await page.getByRole('dialog', { name: 'Meta diária' }).getByLabel('Fechar metas').click()

  await editor.click()
  await page.keyboard.insertText('um dois três quatro')
  await expect(page.locator('.statusbar .daily')).toHaveAttribute('data-goal-reached', 'false')

  await page.keyboard.insertText(' cinco')
  await expect(page.locator('.statusbar .daily')).toHaveAttribute('data-goal-reached', 'true')
  await expect(page.locator('[data-writing-goal-confetti]')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __escrevaralGoalCelebrations?: number }).__escrevaralGoalCelebrations ?? 0
  ))).toBe(1)

  await page.keyboard.insertText(' seis sete')
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __escrevaralGoalCelebrations?: number }).__escrevaralGoalCelebrations ?? 0
  ))).toBe(1)
})

test('preferência por movimento reduzido preserva o evento sem animar confete', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    ;(window as Window & { __escrevaralGoalCelebrations?: number }).__escrevaralGoalCelebrations = 0
    window.addEventListener('escrevaral:writing-goal-achieved', () => {
      const target = window as Window & { __escrevaralGoalCelebrations?: number }
      target.__escrevaralGoalCelebrations = (target.__escrevaralGoalCelebrations ?? 0) + 1
    })
  })

  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Metas', exact: true }).click()
  await page.getByLabel('Meta diária de palavras').fill('1')
  await page.getByRole('dialog', { name: 'Meta diária' }).getByLabel('Fechar metas').click()

  await editor.click()
  await page.keyboard.insertText('palavra')
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __escrevaralGoalCelebrations?: number }).__escrevaralGoalCelebrations ?? 0
  ))).toBe(1)
  await expect(page.locator('[data-writing-goal-confetti]')).toHaveCount(0)
})
