import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function createCleanDocument(page: Page, title: string) {
  const initialId = await page.locator('.note-card.active').getAttribute('data-document-id')
  await page.keyboard.press('Control+N')
  await expect.poll(async () => page.locator('.note-card.active').getAttribute('data-document-id')).not.toBe(initialId)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function openVoice(page: Page) {
  await page.getByRole('tab', { name: 'voz', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'voz', exact: true })).toHaveAttribute('aria-selected', 'true')
}

test('documento vazio não produz falso diagnóstico de voz', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Página vazia')
  await openVoice(page)
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(page.getByRole('status')).toHaveText(/página está vazia/i)
  await expect(page.locator('.voice-reading')).toHaveCount(0)
})

test('corpus curto é apresentado como hipótese de baixa confiança', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Voz curta')
  await editor.fill('O elevador parou entre dois andares. Ela respirou devagar. A luz piscou e o silêncio pareceu maior que o prédio.')
  await openVoice(page)
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()

  await expect(page.locator('.voice-reading')).toBeVisible()
  await expect(page.locator('.voice-confidence')).toContainText(/baixa/i)
  await expect(page.locator('.voice-card h2')).not.toBeEmpty()
  await expect(page.locator('.voice-caution')).toContainText(/curto|instável|hipótese/i)
  await expect(page.locator('.voice-disclaimer')).toContainText(/heurística|hipótese|diagnóstico/i)
})

test('resultado do Espelho de Voz é invalidado quando o texto muda', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Voz em mudança')
  await editor.fill('A rua acordou cedo. O ônibus dobrou a esquina e a feira abriu suas vozes, seus cheiros e suas lonas coloridas.')
  await openVoice(page)
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(page.locator('.voice-reading')).toBeVisible()

  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' Uma chuva fina começou.')

  await expect(page.locator('.voice-reading')).toHaveCount(0)
  await expect(page.getByRole('status')).toContainText(/texto mudou/i)
})