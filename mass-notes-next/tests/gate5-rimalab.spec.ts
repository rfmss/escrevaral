import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

async function openRimaLab(page: Page) {
  await page.getByRole('tab', { name: 'rimalab', exact: true }).click()
  const panel = page.locator('#panel-rimalab')
  await expect(panel).toBeVisible()
  return panel
}

async function replaceEditorText(page: Page, text: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText(text)
  await expect(editor).toContainText(text.split('\n')[0])
  await expect(page.getByText(/Salvo|Alterado|Salvando/).first()).toBeVisible()
}

test('RimaLab mantém prosa e verso em contratos diferentes', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)

  await replaceEditorText(page, 'A rua dorme sob a chuva. A janela guarda um rumor distante.')
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.getByText('Leitura de prosa')).toBeVisible()
  await expect(panel.getByText(/eco|repetição|cadência/i).first()).toBeVisible()

  await replaceEditorText(page, 'A lua cai no chão\nO sino chama o vento\nA noite guarda a mão')
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.getByText('Leitura de verso')).toBeVisible()
  await expect(panel.getByText(/metro|escansão|estrofe/i).first()).toBeVisible()
})

test('prosa sem ecos recebe retorno neutro e não falsa escansão', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)
  await replaceEditorText(page, 'A mesa sustenta o caderno. O ônibus cruza a avenida. Uma porta permanece aberta.')
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.getByText('Leitura de prosa')).toBeVisible()
  await expect(panel.getByText(/nenhum eco sonoro|sem padrão sonoro/i)).toBeVisible()
  await expect(panel.getByText(/escansão silábica/i)).toHaveCount(0)
})

test('poema rimado apresenta estrofes, esquema e escansão', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)
  await replaceEditorText(page, 'Canto baixo no terreiro\nGuardo o sonho verdadeiro\n\nVem a chuva no caminho\nVolta o pássaro ao seu ninho')
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.getByText('Leitura de verso')).toBeVisible()
  await expect(panel.getByText(/2 estrofes/i)).toBeVisible()
  await expect(panel.getByText(/esquema/i).first()).toBeVisible()
  await expect(panel.getByText(/escansão/i).first()).toBeVisible()
})

test('verso livre e ausência de rima não são tratados como defeito', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)
  await replaceEditorText(page, 'Pedra no bolso\nA cidade acende\nCorpo atravessa neblina')
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.getByText('Leitura de verso')).toBeVisible()
  await expect(panel.getByText(/ausência de rima não é defeito/i)).toBeVisible()
})

test('RimaLab não altera o manuscrito nem oferece aplicação automática', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)
  const editor = page.getByLabel('Texto do documento')
  await replaceEditorText(page, 'O rio risca a pedra\nA pedra guarda o rio')
  const before = await editor.innerText()
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.locator('button')).toHaveCount(1)
  await expect(editor).toHaveText(before)
})

test('falha controlada do RimaLab não quebra editor nem engines anteriores', async ({ page }) => {
  await waitReady(page)
  const editor = page.getByLabel('Texto do documento')
  await replaceEditorText(page, 'A palavra permanece disponível mesmo quando a oficina falha.')
  const panel = await openRimaLab(page)

  await page.evaluate(() => {
    const engine = window.VeredaRimaLab
    if (!engine) throw new Error('RimaLab não carregou para o teste.')
    engine.analyze = () => { throw new Error('falha controlada') }
  })
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.getByRole('status')).toContainText(/não pôde concluir/i)
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.type(' O editor segue funcionando.')
  await expect(editor).toContainText('O editor segue funcionando.')
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await expect(page.getByRole('button', { name: /analisar em português brasileiro/i })).toBeVisible()
})

test('RimaLab permanece acessível e sem overflow no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(dialog).toBeVisible()
  const panel = await openRimaLab(page)
  await expect(panel.getByText(/ausência de rima não é defeito/i)).toBeVisible()
  await expect(page.getByRole('tab')).toHaveCount(7)

  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.documentElement.scrollWidth,
    rail: document.querySelector('.rail')?.scrollWidth ?? 0,
    railClient: document.querySelector('.rail')?.clientWidth ?? 0,
  }))
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport)
  expect(sizes.rail).toBeLessThanOrEqual(sizes.railClient)
})
