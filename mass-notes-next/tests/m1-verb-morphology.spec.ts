import { expect, test, type Page } from '@playwright/test'
import {
  COMPOUND_VERB_CASES,
  CONTEXTUAL_VERB_CASES,
  IRREGULAR_AND_CLITIC_CASES,
  NEGATIVE_VERB_CASES,
  REGULAR_VERB_CASES,
  type VerbMorphologyCase,
} from './fixtures/verb-morphology-corpus'

function normalized(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

async function setManuscript(page: Page, manuscript: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.fill(manuscript)
  await expect.poll(async () => normalized(await editor.innerText())).toBe(normalized(manuscript))
  await expect.poll(() => editor.evaluate((element, expected) => {
    const host = element as HTMLElement & {
      __escrevaralPositionContract?: { snapshot?: { text?: string } }
    }
    return normalized(host.__escrevaralPositionContract?.snapshot?.text ?? '') === normalized(expected)
  }, manuscript), {
    intervals: [50, 100, 250],
  }).toBe(true)
  return editor
}

async function consult(page: Page, query: string) {
  await page.getByLabel('Palavra ou expressão curta').fill(query)
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.getByRole('status')).toContainText(/concluída|não encontrei|não pôde/iu)
}

async function assertVerbCase(page: Page, item: VerbMorphologyCase) {
  await test.step(item.id, async () => {
    const editor = await setManuscript(page, item.manuscript)
    const htmlBefore = await editor.innerHTML()
    await consult(page, item.query)
    const card = page.locator('[data-verb-analysis]')
    await expect(card).toBeVisible()
    for (const expected of item.expected) await expect(card).toContainText(expected)
    expect(await editor.innerHTML()).toBe(htmlBefore)
    await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
  })
}

test('paradigmas regulares cobrem modos tempos pessoas e formas nominais', async ({ page }) => {
  test.setTimeout(150_000)
  await waitReady(page)
  for (const item of REGULAR_VERB_CASES) await assertVerbCase(page, item)
})

test('irregulares e clíticos cobrem ambiguidade próclise ênclise e mesóclise', async ({ page }) => {
  test.setTimeout(150_000)
  await waitReady(page)
  for (const item of IRREGULAR_AND_CLITIC_CASES) await assertVerbCase(page, item)
})

test('locuções cobrem tempos compostos progressivo futuro e voz passiva', async ({ page }) => {
  test.setTimeout(120_000)
  await waitReady(page)
  for (const item of COMPOUND_VERB_CASES) await assertVerbCase(page, item)
})

test('contexto distingue verbo de substantivo e adjetivo', async ({ page }) => {
  test.setTimeout(90_000)
  await waitReady(page)
  for (const item of CONTEXTUAL_VERB_CASES) await assertVerbCase(page, item)
  for (const item of NEGATIVE_VERB_CASES) {
    await test.step(item.id, async () => {
      const editor = await setManuscript(page, item.manuscript)
      const htmlBefore = await editor.innerHTML()
      await consult(page, item.query)
      await expect(page.locator('[data-verb-analysis]')).toHaveCount(0)
      expect(await editor.innerHTML()).toBe(htmlBefore)
    })
  }
})
