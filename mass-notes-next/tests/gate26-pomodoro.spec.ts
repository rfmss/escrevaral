import { expect, test } from '@playwright/test'

test('temporizador de 25 min pausa, continua, persiste rodada e celebra a conclusão', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('vereda:timer-rounds')
    ;(window as Window & { __sessionCompletions?: number }).__sessionCompletions = 0
    window.addEventListener('escrevaral:writing-session-completed', () => {
      const target = window as Window & { __sessionCompletions?: number }
      target.__sessionCompletions = (target.__sessionCompletions ?? 0) + 1
    })
  })

  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await page.clock.install()

  await page.getByRole('button', { name: 'Metas', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Meta diária' })
  const display = panel.locator('[data-writing-session-display]')
  await expect(display).toHaveText('25:00')
  await expect(panel).toContainText('0 rodadas concluídas')

  await panel.getByRole('button', { name: 'Começar', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible()
  await page.clock.fastForward(1_000)
  await expect(display).toHaveText('24:59')

  await panel.getByRole('button', { name: 'Pausar', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Continuar', exact: true })).toBeVisible()
  await page.clock.fastForward(5_000)
  await expect(display).toHaveText('24:59')

  await panel.getByRole('button', { name: 'Continuar', exact: true }).click()
  await page.clock.fastForward(24 * 60 * 1_000 + 59_000)

  await expect(display).toHaveText('25:00')
  await expect(panel).toContainText('1 rodada concluída')
  await expect(page.getByText('Primeira rodada concluída. Boa escrita.')).toBeVisible()
  await expect(page.locator('[data-writing-session-confetti]')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __sessionCompletions?: number }).__sessionCompletions ?? 0
  ))).toBe(1)

  const rounds = await page.evaluate(() => JSON.parse(localStorage.getItem('vereda:timer-rounds') ?? '[]') as Array<{ mins?: number }>)
  expect(rounds).toHaveLength(1)
  expect(rounds[0]?.mins).toBe(25)
})

test('reiniciar devolve a sessão a 25:00 sem registrar rodada', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('vereda:timer-rounds'))
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await page.clock.install()

  await page.getByRole('button', { name: 'Metas', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Meta diária' })
  const display = panel.locator('[data-writing-session-display]')

  await panel.getByRole('button', { name: 'Começar', exact: true }).click()
  await page.clock.fastForward(12_000)
  await expect(display).toHaveText('24:48')
  await panel.getByRole('button', { name: 'Reiniciar', exact: true }).click()
  await expect(display).toHaveText('25:00')
  await expect(panel.getByRole('button', { name: 'Começar', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('vereda:timer-rounds') ?? '[]').length)).toBe(0)
})
