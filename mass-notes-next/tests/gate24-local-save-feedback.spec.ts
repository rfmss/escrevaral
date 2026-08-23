import { expect, test } from '@playwright/test'

test('estado salvo não sugere nuvem e a primeira digitação explica o salvamento local uma única vez', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()

  const sync = page.locator('.statusbar .sync')
  await expect(sync.locator('.eyebrow')).toHaveText('SALVO LOCALMENTE')
  await expect(sync).toHaveAttribute('title', /salvo neste navegador/i)
  await expect(sync).not.toContainText('SINCRONIZADO')

  await editor.click()
  await page.keyboard.insertText(' microfeedback')
  const hint = page.getByRole('status').filter({ hasText: 'Texto salvo aqui, neste navegador. Sem internet, sem nuvem.' })
  await expect(hint).toBeVisible()
  await hint.getByLabel('Fechar aviso de salvamento local').click()
  await expect(hint).toBeHidden()

  await page.reload()
  const reloadedEditor = page.getByLabel('Texto do documento')
  await expect(reloadedEditor).toBeEditable()
  await reloadedEditor.click()
  await page.keyboard.insertText(' outra edição')
  await expect(page.getByText('Texto salvo aqui, neste navegador. Sem internet, sem nuvem.')).toHaveCount(0)
})
