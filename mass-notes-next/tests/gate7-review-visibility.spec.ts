import { expect, test, type Page } from '@playwright/test'

type ContractHost = HTMLElement & {
  __escrevaralPositionContract?: {
    snapshot: {
      contentSignature: string
      text: string
    }
  }
}

const HTML = [
  '<p>A oficina abriu cedo e cada pessoa trouxe um caderno para trabalhar com atenção.</p>',
  '<p>Ela tentou mas não conseguiu terminar a revisão antes do café.</p>',
  '<p>Depois, conferiu os títulos, guardou o arquivo e combinou continuar o trabalho no fim da tarde.</p>',
].join('')

const TEXT = [
  'A oficina abriu cedo e cada pessoa trouxe um caderno para trabalhar com atenção.',
  'Ela tentou mas não conseguiu terminar a revisão antes do café.',
  'Depois, conferiu os títulos, guardou o arquivo e combinou continuar o trabalho no fim da tarde.',
].join('\n\n')

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect.poll(() => page.locator('.ProseMirror').evaluate((element) =>
    Boolean((element as ContractHost).__escrevaralPositionContract))).toBe(true)
}

async function prepareReview(page: Page) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await editor.evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.text)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html: HTML, text: TEXT })
  await expect.poll(() => editor.evaluate((element) =>
    (element as ContractHost).__escrevaralPositionContract?.snapshot.text ?? null)).toBe(TEXT)
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.locator('.review-located-card')).not.toHaveCount(0, { timeout: 15_000 })
  return editor
}

test('marcas podem ser ocultadas e restauradas sem apagar leitura ou conteúdo', async ({ page }) => {
  await waitReady(page)
  const editor = await prepareReview(page)
  const before = await editor.evaluate((element) => {
    const snapshot = (element as ContractHost).__escrevaralPositionContract?.snapshot
    if (!snapshot) throw new Error('Contrato ausente.')
    return { signature: snapshot.contentSignature, text: snapshot.text }
  })

  const decoration = page.locator('[data-review-issue-id]').first()
  const cards = page.locator('.review-located-card')
  const cardCount = await cards.count()
  await expect(decoration).toBeVisible()

  await page.getByRole('button', { name: 'Ocultar marcas' }).click()
  await expect(page.locator('body')).toHaveClass(/review-marks-hidden/)
  await expect(page.getByRole('button', { name: 'Mostrar marcas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(cards).toHaveCount(cardCount)
  await expect(decoration).toHaveCSS('box-shadow', 'none')
  await expect(decoration).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  await page.getByRole('button', { name: 'Mostrar marcas' }).click()
  await expect(page.locator('body')).not.toHaveClass(/review-marks-hidden/)
  await expect(page.getByRole('button', { name: 'Ocultar marcas' })).toHaveAttribute('aria-pressed', 'false')
  await expect(cards).toHaveCount(cardCount)
  await expect(decoration).not.toHaveCSS('box-shadow', 'none')

  const after = await editor.evaluate((element) => {
    const snapshot = (element as ContractHost).__escrevaralPositionContract?.snapshot
    if (!snapshot) throw new Error('Contrato ausente.')
    return { signature: snapshot.contentSignature, text: snapshot.text }
  })
  expect(after).toEqual(before)
})
