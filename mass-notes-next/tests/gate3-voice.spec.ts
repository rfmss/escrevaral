import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function openVoice(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (!await dialog.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    const launcher = page.getByRole('button', { name: 'Escutar voz' })
    await expect(launcher).toBeVisible()
    await launcher.click()
    await expect(dialog).toBeVisible()
  }
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

test('corpus médio produz leitura normalizada e evidência visual', async ({ page }, testInfo) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Voz brasileira')
  const paragraph = 'A mulher atravessou a rua cedo, levando na bolsa uma carta antiga e o cheiro do café da casa. Na feira, as vozes chamavam nomes, preços e lembranças enquanto o ônibus passava devagar pela esquina. '
  await editor.fill(Array.from({ length: 12 }, () => paragraph).join('\n\n'))
  await openVoice(page)
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()

  await expect(page.locator('.voice-reading')).toBeVisible()
  await expect(page.locator('.voice-confidence')).toContainText(/média/i)
  await expect(page.locator('.voice-card h2')).not.toBeEmpty()
  await expect(page.locator('.voice-metrics div')).toHaveCount(3)
  await expect(page.locator('.voice-section').first()).toBeVisible()
  await page.screenshot({ path: `test-results/espelho-de-voz-${testInfo.project.name}.png`, fullPage: true })
})

test('temperatura e campos semânticos da engine chegam à interface', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Sinais de voz')
  const paragraph = 'A saudade atravessou a noite em silêncio, entre perda e memória. Na rua, o ônibus dobrou a esquina do bairro enquanto a cidade respirava sob a chuva.'
  await editor.fill(Array.from({ length: 10 }, () => paragraph).join('\n\n'))
  await openVoice(page)
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()

  await expect(page.getByRole('heading', { name: 'Temperatura' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Campos' })).toBeVisible()
  await expect(page.locator('.voice-signal-section').filter({ hasText: 'melancolia' })).toBeVisible()
  await expect(page.locator('.voice-signal-section').filter({ hasText: 'cidade' })).toBeVisible()
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

test('falha controlada da engine não quebra o editor', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Falha isolada')
  await editor.fill('Uma página pequena para validar o isolamento da engine.')
  await openVoice(page)
  await page.evaluate(() => {
    const target = window as typeof window & {
      VeredaVoice?: { analyze: (text: string) => unknown }
      __escrevaralVoiceLoaded?: boolean
    }
    target.VeredaVoice = { analyze: () => { throw new Error('falha controlada') } }
    target.__escrevaralVoiceLoaded = true
  })

  await page.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(page.getByRole('status')).toContainText(/não pôde concluir/i)
  await expect(page.locator('.voice-reading')).toHaveCount(0)
  await expect(editor).toBeEditable()
})
