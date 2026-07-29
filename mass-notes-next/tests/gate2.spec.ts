import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function newDocument(page: Page, title: string) {
  const documentsBefore = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(documentsBefore + 1)
  await expect(page.getByLabel('Título do documento')).toHaveValue('')
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function pasteRichText(page: Page, html: string, plain: string) {
  await page.locator('.ProseMirror').evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })
}

test('paste de Word e Google Docs produz documento estruturado e seguro', async ({ page }) => {
  await waitReady(page)
  const editor = await newDocument(page, 'Colagem externa')

  await pasteRichText(page, `
    <div class="docs-internal-guid-123" style="font-family: Arial">
      <h2 style="color:red">Capítulo brasileiro</h2>
      <p class="MsoNormal"><strong>Começo</strong> com <span style="font-weight:700">ênfase</span>.</p>
      <ul><li>Primeiro item</li><li>Segundo item</li></ul>
      <img src=x onerror="window.__pasteAttack=true">
      <script>window.__pasteAttack=true</script>
      <a href="javascript:window.__pasteAttack=true">atalho perigoso</a>
    </div>
  `, 'Capítulo brasileiro\nComeço com ênfase.\nPrimeiro item\nSegundo item\natalho perigoso')

  await expect(editor.locator('h2')).toHaveText('Capítulo brasileiro')
  await expect(editor.locator('strong').first()).toContainText('Começo')
  await expect(editor.locator('li')).toHaveCount(2)
  await expect(editor.locator('script, style, img')).toHaveCount(0)
  const html = await editor.innerHTML()
  expect(html).not.toMatch(/onerror|javascript:|MsoNormal|docs-internal-guid|style=/i)
  await expect.poll(() => page.evaluate(() => Boolean((window as typeof window & { __pasteAttack?: boolean }).__pasteAttack))).toBe(false)
})

test('toolbar preserva seleção e listas continuam estruturadas', async ({ page }) => {
  await waitReady(page)
  const editor = await newDocument(page, 'Seleção e listas')
  await page.keyboard.type('Texto selecionado')

  await editor.evaluate((element) => {
    const paragraph = element.querySelector('p')
    const text = paragraph?.firstChild
    if (!text) throw new Error('Parágrafo sem texto para selecionar.')
    const range = document.createRange()
    range.selectNodeContents(text)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  })
  await page.getByRole('button', { name: 'N', exact: true }).click()
  await expect(editor.locator('strong')).toHaveText('Texto selecionado')

  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Primeiro')
  await editor.evaluate((element) => {
    const paragraph = element.querySelector('p')
    if (!paragraph) throw new Error('Parágrafo ausente para criar lista.')
    const range = document.createRange()
    range.selectNodeContents(paragraph)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  })
  await page.getByRole('button', { name: '• Lista', exact: true }).click()
  await expect(editor.locator('ul li')).toHaveCount(1)
  await editor.locator('li').first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Segundo')
  await expect(editor.locator('ul li')).toHaveCount(2)
})

test('recupera edição interrompida antes do autosave', async ({ context, page }) => {
  await waitReady(page)
  const editor = await newDocument(page, 'Recuperação imediata')
  await page.keyboard.type('Este trecho precisa sobreviver ao fechamento abrupto.')

  await page.waitForFunction(() => localStorage.getItem('escrevaral-mass-notes-next-recovery')?.includes('fechamento abrupto'))
  await page.close()

  const restored = await context.newPage()
  await waitReady(restored)
  await expect(restored.getByLabel('Título do documento')).toHaveValue('Recuperação imediata')
  await expect(restored.locator('.ProseMirror')).toContainText('Este trecho precisa sobreviver ao fechamento abrupto.')
})

test('conflito preserva a versão local como nova página', async ({ context, page }) => {
  await waitReady(page)
  const second = await context.newPage()
  await waitReady(second)

  await page.getByLabel('Título do documento').fill('Versão persistida A')
  await page.waitForTimeout(100)
  await second.getByLabel('Título do documento').fill('Versão local B')

  await expect(second.getByRole('alert')).toContainText('Outra aba também alterou')
  await second.getByRole('button', { name: 'Guardar a minha como cópia' }).click()
  await expect(second.getByRole('alert')).toHaveCount(0)
  await expect(second.getByLabel('Título do documento')).toHaveValue('Versão local B — conflito')

  await page.reload()
  await expect(page.getByText('Versão local B — conflito', { exact: true })).toBeVisible()
  await expect(page.getByText('Versão persistida A', { exact: true })).toBeVisible()
  await page.getByText('Versão persistida A', { exact: true }).click()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Versão persistida A')
})

test('drawers móveis contêm foco, fecham por Escape e devolvem foco', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)

  const libraryTrigger = page.getByRole('button', { name: 'Abrir arquivo' })
  await libraryTrigger.click()
  const library = page.getByRole('dialog', { name: 'Arquivo de documentos' })
  await expect(library).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fechar arquivo' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest('#document-library')?.id)).toBe('document-library')
  await page.keyboard.press('Escape')
  await expect(library).not.toBeVisible()
  await expect(libraryTrigger).toBeFocused()

  const toolsTrigger = page.getByRole('button', { name: 'Abrir ferramentas' })
  await toolsTrigger.click()
  const tools = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(tools).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fechar ferramentas' })).toBeFocused()
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'revisao', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Escape')
  await expect(tools).not.toBeVisible()
  await expect(toolsTrigger).toBeFocused()
})
