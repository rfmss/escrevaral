import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect(page.locator('.sync-save')).toContainText(/Salvo|Alterado/)
}

async function leaveFocus(page: Page) {
  if (await page.locator('body').evaluate((body) => body.classList.contains('focus-mode'))) {
    await page.keyboard.press('Escape')
    await expect(page.locator('body')).not.toHaveClass(/focus-mode/)
  }
}

async function openReview(page: Page) {
  await leaveFocus(page)
  const research = page.getByRole('button', { name: 'Pesquisa' })
  await expect(research).toBeVisible()
  await research.click()
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(dialog).toBeVisible()
  const tab = dialog.getByRole('tab', { name: 'revisao', exact: true })
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  return dialog
}

async function expectTitleFits(page: Page) {
  const title = page.getByLabel('Título do documento')
  await expect.poll(() => title.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true)
}

test('shell canônico mantém manuscrito, biblioteca, análise e status acessíveis', async ({ page }) => {
  await waitReady(page)

  await expect(page.locator('.topbar')).toBeVisible()
  await expect(page.locator('.left-rail')).toBeVisible()
  await expect(page.locator('.workspace')).toBeVisible()
  await expect(page.locator('.analysis-panel')).toBeVisible()
  await expect(page.locator('.statusbar')).toBeVisible()
  await expect(page.locator('.formatbar')).toBeVisible()
  await expectTitleFits(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/mass-notes-next-desktop.png', fullPage: true })
})

test('marca e ações principais da casa canônica continuam identificáveis', async ({ page }) => {
  await waitReady(page)

  await expect(page.locator('.brand-name')).toContainText(/ESCREVARAL/i)
  await expect(page.locator('.brand-tagline')).toHaveText(/ESCRITA COM INTENÇÃO/i)
  await expect(page.getByRole('button', { name: 'Abrir oficina de ferramentas' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pesquisa' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible()
})

test('parágrafos permanecem estruturais e o undo do Tiptap continua reversível', async ({ page }) => {
  await waitReady(page)
  await page.keyboard.press('Control+N')
  await page.getByLabel('Título do documento').fill('Estrutura segura')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.type('Primeiro parágrafo')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Segundo parágrafo')

  await expect(editor.locator('p')).toHaveCount(2)
  await expect(editor.locator('p').nth(0)).toHaveText('Primeiro parágrafo')
  await expect(editor.locator('p').nth(1)).toHaveText('Segundo parágrafo')

  await page.keyboard.press('Control+z')
  await expect(editor).not.toContainText('Segundo parágrafo')
})

test('duas abas não sobrescrevem silenciosamente o mesmo documento', async ({ context, page }) => {
  await waitReady(page)
  const second = await context.newPage()
  await waitReady(second)

  await page.getByLabel('Título do documento').fill('Versão da aba A')
  await page.waitForTimeout(100)
  await second.getByLabel('Título do documento').fill('Versão da aba B')
  await expect(second.getByRole('alert')).toContainText('Outra aba também alterou')
  await expect(second.getByText('Nenhuma versão será apagada silenciosamente.')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Versão da aba A')
})

test('a engine real de revisão continua acessível pela Pesquisa canônica', async ({ page }) => {
  await waitReady(page)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Ela entrou para dentro da casa. O coração acelerou, o coração acelerou.')
  const dialog = await openReview(page)

  await expect(dialog.getByRole('status')).toHaveText(/observa|Nenhuma|página está vazia/i, { timeout: 15_000 })
})

test('revisão profunda inicializa syntax e projeta achado sintático no painel', async ({ page }) => {
  await waitReady(page)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Os autores chegaram cedo e abriram a oficina enquanto todos aguardavam uma leitura cuidadosa do texto brasileiro.')
  const dialog = await openReview(page)

  await expect(dialog.getByRole('status')).toHaveText(/observa|Nenhuma/i, { timeout: 15_000 })
  const syntaxReady = await page.evaluate(() => Boolean((window as typeof window & {
    syntaxEngine?: { _isReady?: () => boolean }
  }).syntaxEngine?._isReady?.()))
  expect(syntaxReady).toBe(true)

  await page.evaluate(() => {
    const target = window as typeof window & {
      syntaxEngine?: { analisarPeriodo?: (text: string) => unknown }
    }
    if (!target.syntaxEngine) throw new Error('syntaxEngine ausente')
    target.syntaxEngine.analisarPeriodo = () => ({
      resumo: {
        alertas: [{ descricao: 'Concordância sintática de integração.' }],
        apostos: [],
      },
    })
  })

  await dialog.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(dialog.locator('.review-located-card').filter({ hasText: 'PONT-SYNT-01' })).toBeVisible({ timeout: 15_000 })
  await expect(dialog.locator('.review-located-card').filter({ hasText: 'Concordância sintática de integração.' })).toBeVisible()
})

test('mobile não cria overflow e mantém drawers fecháveis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await expectTitleFits(page)
  await page.getByRole('button', { name: 'Abrir arquivo' }).click()
  await expect(page.locator('.sidebar')).toHaveClass(/open/)
  await page.keyboard.press('Escape')
  await expect(page.locator('.sidebar')).not.toHaveClass(/open/)
  await page.screenshot({ path: 'test-results/mass-notes-next-mobile.png', fullPage: true })
})
