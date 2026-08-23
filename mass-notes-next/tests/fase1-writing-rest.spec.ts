import { expect, test, type Page } from 'playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/writing-rest/)
}

for (const viewport of [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
]) {
  test(`repouso aprovado permanece silencioso em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await waitReady(page)

    const body = page.locator('body')
    const paper = page.locator('.paper')
    const editor = page.locator('.ProseMirror')
    const title = page.getByLabel('Título do documento')
    const library = page.locator('.paper-shell > .left-rail')
    const analysis = page.locator('.paper-shell > .analysis-panel')

    await expect(body).not.toHaveClass(/workshop-open/)
    await expect(editor).toBeEditable()
    await expect(library).toBeHidden()
    await expect(analysis).toBeHidden()
    await expect(page.locator('.editor-toolbar')).toBeHidden()
    await expect(page.locator('.blueprint')).toBeHidden()
    await expect(page.locator('.impact-button')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })).toBeVisible()

    const geometry = await paper.evaluate((node) => {
      const rect = node.getBoundingClientRect()
      const style = getComputedStyle(node)
      return {
        width: rect.width,
        top: rect.top,
        borderTopWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
      }
    })

    expect(geometry.width).toBeLessThanOrEqual(721)
    expect(geometry.width).toBeGreaterThan(620)
    expect(geometry.top / viewport.height).toBeGreaterThanOrEqual(0.28)
    expect(geometry.top / viewport.height).toBeLessThanOrEqual(0.32)
    expect(geometry.borderTopWidth).toBe('0px')
    expect(geometry.boxShadow).toBe('none')
    expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(geometry.backgroundColor)

    const writingStyle = await editor.evaluate((node) => {
      const style = getComputedStyle(node)
      return {
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        caretColor: style.caretColor,
      }
    })
    expect(writingStyle.fontSize).toBe('19.5px')
    expect(writingStyle.lineHeight).toBe('33px')
    expect(writingStyle.caretColor).toBe('rgb(0, 105, 114)')

    const titleSize = await title.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
    expect(titleSize).toBeLessThan(Number.parseFloat(writingStyle.fontSize))

    await page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' }).click()
    await expect(body).toHaveClass(/workshop-open/)
    await expect(library).toBeVisible()
    await expect(analysis).toBeVisible()
    await expect(page.getByRole('button', { name: 'Voltar à escrita silenciosa' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(body).not.toHaveClass(/workshop-open/)
    await expect(library).toBeHidden()
    await expect(analysis).toBeHidden()
  })
}
