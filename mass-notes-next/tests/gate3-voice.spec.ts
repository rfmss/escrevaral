import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.chapter').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.chapter')).toHaveCount(initialCount + 1)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function ensureToolsOpen(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (await dialog.isVisible().catch(() => false)) return dialog
  if (await page.locator('body.focus-mode').count()) await page.keyboard.press('Escape')
  const launcher = page.getByRole('button', { name: 'Abrir oficina de ferramentas' })
  await expect(launcher).toBeVisible()
  await launcher.click()
  await expect(dialog).toBeVisible()
  return dialog
}

async function openVoice(page: Page) {
  const dialog = await ensureToolsOpen(page)
  await dialog.getByRole('tab', { name: 'voz', exact: true }).click()
  await expect(dialog.getByRole('tab', { name: 'voz', exact: true })).toHaveAttribute('aria-selected', 'true')
  return dialog
}

async function closeTools(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: 'Fechar ferramentas' }).click()
    await expect(dialog).toBeHidden()
  }
}

test('documento vazio não produz falso diagnóstico de voz', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Página vazia')
  const dialog = await openVoice(page)
  await dialog.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(dialog.getByRole('status')).toHaveText(/página está vazia/i)
  await expect(dialog.locator('.voice-reading')).toHaveCount(0)
})

test('corpus curto é apresentado como hipótese de baixa confiança', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Voz curta')
  await editor.fill('O elevador parou entre dois andares. Ela respirou devagar. A luz piscou e o silêncio pareceu maior que o prédio.')
  const dialog = await openVoice(page)
  await dialog.getByRole('button', { name: 'Escutar minha voz' }).click()

  await expect(dialog.locator('.voice-reading')).toBeVisible()
  await expect(dialog.locator('.voice-confidence')).toContainText(/baixa/i)
  await expect(dialog.locator('.voice-card h2')).not.toBeEmpty()
  await expect(dialog.locator('.voice-caution')).toContainText(/curto|instável|hipótese/i)
  await expect(dialog.locator('.voice-disclaimer')).toContainText(/heurística|hipótese|diagnóstico/i)
})

test('corpus médio produz leitura normalizada e evidência visual', async ({ page }, testInfo) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Voz brasileira')
  const paragraph = 'A mulher atravessou a rua cedo, levando na bolsa uma carta antiga e o cheiro do café da casa. Na feira, as vozes chamavam nomes, preços e lembranças enquanto o ônibus passava devagar pela esquina. '
  await editor.fill(Array.from({ length: 12 }, () => paragraph).join('\n\n'))
  const dialog = await openVoice(page)
  await dialog.getByRole('button', { name: 'Escutar minha voz' }).click()

  await expect(dialog.locator('.voice-reading')).toBeVisible()
  await expect(dialog.locator('.voice-confidence')).toContainText(/média/i)
  await expect(dialog.locator('.voice-card h2')).not.toBeEmpty()
  await expect(dialog.locator('.voice-metrics div')).toHaveCount(3)
  await expect(dialog.locator('.voice-section').first()).toBeVisible()
  await page.screenshot({ path: `test-results/espelho-de-voz-${testInfo.project.name}.png`, fullPage: true })
})

test('temperatura e campos semânticos da engine chegam à interface', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Sinais de voz')
  const paragraph = 'A saudade atravessou a noite em silêncio, entre perda e memória. Na rua, o ônibus dobrou a esquina do bairro enquanto a cidade respirava sob a chuva.'
  await editor.fill(Array.from({ length: 10 }, () => paragraph).join('\n\n'))
  const dialog = await openVoice(page)
  await dialog.getByRole('button', { name: 'Escutar minha voz' }).click()

  await expect(dialog.getByRole('heading', { name: 'Temperatura' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Campos' })).toBeVisible()
  await expect(dialog.locator('.voice-signal-section').filter({ hasText: 'melancolia' })).toBeVisible()
  await expect(dialog.locator('.voice-signal-section').filter({ hasText: 'cidade' })).toBeVisible()
})

test('resultado do Espelho de Voz é invalidado quando o texto muda', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Voz em mudança')
  await editor.fill('A rua acordou cedo. O ônibus dobrou a esquina e a feira abriu suas vozes, seus cheiros e suas lonas coloridas.')
  let dialog = await openVoice(page)
  await dialog.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(dialog.locator('.voice-reading')).toBeVisible()

  await closeTools(page)
  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' Uma chuva fina começou.')

  dialog = await openVoice(page)
  await expect(dialog.locator('.voice-reading')).toHaveCount(0)
  await expect(dialog.getByRole('status')).toContainText(/texto mudou/i)
})

test('falha controlada da engine não quebra o editor', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Falha isolada')
  await editor.fill('Uma página pequena para validar o isolamento da engine.')
  const dialog = await openVoice(page)
  await page.evaluate(() => {
    const target = window as typeof window & {
      VeredaVoice?: { analyze: (text: string) => unknown }
      __escrevaralVoiceLoaded?: boolean
    }
    target.VeredaVoice = { analyze: () => { throw new Error('falha controlada') } }
    target.__escrevaralVoiceLoaded = true
  })

  await dialog.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(dialog.getByRole('status')).toContainText(/não pôde concluir/i)
  await expect(dialog.locator('.voice-reading')).toHaveCount(0)
  await expect(editor).toBeEditable()
})
