import { readFileSync } from 'node:fs'
import { expect, test, type Locator, type Page } from '@playwright/test'

type EvaluationCase = {
  id: string
  phenomenon: string
  manuscript: string
  query: string
  shouldFind: boolean
  includes: string[]
  excludes: string[]
  targetExpected?: boolean
  targetLabel?: string
}

const evaluation = JSON.parse(
  readFileSync(new URL('../fixtures/verb-morphology-evaluation.json', import.meta.url), 'utf8'),
) as { cases: EvaluationCase[] }

function normalized(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

async function openLexicalPanel(page: Page) {
  const restOpener = page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })
  if (await restOpener.isVisible()) {
    await restOpener.click()
    await expect(page.locator('body')).toHaveClass(/workshop-open/)
  }

  const panel = page.locator('#panel-palavras')
  const input = page.locator('#lexical-query:visible')
  if (await input.count()) return

  /* O rail lexical continua sendo a superfície real avaliada. No chrome novo,
     primeiro é preciso abrir a análise pela ação pública Pesquisa; só então a
     aba Palavras existe de forma interativa. Nenhuma expectativa linguística muda. */
  const rail = page.locator('#text-tools')
  if (!(await rail.isVisible())) {
    const researchLauncher = page.getByRole('button', { name: 'Pesquisa', exact: true })
    await expect(researchLauncher).toBeVisible()
    await researchLauncher.click()
    await expect(rail).toBeVisible()
  }

  const lexicalTab = page.getByRole('tab', { name: 'palavras', exact: true })
  await expect(lexicalTab).toBeVisible()
  await lexicalTab.click()

  await expect(panel).toBeVisible()
  await expect(page.locator('#lexical-query:visible')).toBeVisible()
}

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await openLexicalPanel(page)
}

async function setManuscript(page: Page, manuscript: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.fill(manuscript)
  await expect.poll(async () => normalized(await editor.innerText())).toBe(normalized(manuscript))
  return editor
}

async function consult(page: Page, query: string) {
  /* Alterar o manuscrito pode recolher chrome contextual. A banca deve navegar
     pela UI vigente antes de consultar, sem mudar nenhuma expectativa linguística. */
  await openLexicalPanel(page)
  const input = page.locator('#lexical-query:visible')
  await input.fill(query)
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.getByRole('status')).toContainText(/concluída|não encontrei|não pôde/iu)
}

async function primaryText(card: Locator): Promise<string> {
  const heading = card.locator('.verb-formation-heading')
  const classification = card.locator('.verb-formation-section').first()
  return normalized(`${await heading.innerText()} ${await classification.innerText()}`)
}

async function evaluateTargetCase(card: Locator, item: EvaluationCase) {
  const count = await card.count()
  if (item.targetExpected) {
    await expect(card).toBeVisible()
    const value = await primaryText(card)
    expect(value).toContain(item.targetLabel)
    for (const expected of item.includes) expect(value).toContain(expected)
    for (const excluded of item.excludes) expect(value).not.toContain(excluded)
    return
  }

  if (!count) return
  const value = await primaryText(card)
  if (item.targetLabel) expect(value).not.toContain(item.targetLabel)
  for (const excluded of item.excludes) expect(value).not.toContain(excluded)
}

async function evaluateCase(page: Page, item: EvaluationCase) {
  await setManuscript(page, item.manuscript)
  await consult(page, item.query)
  const card = page.locator('[data-verb-formation-card]')
  await evaluateTargetCase(card, item)
}

test.describe('banca E2-V adversarial fora do gate de regressão', () => {
  for (const item of evaluation.cases.filter((entry) => entry.phenomenon === 'infinitivo-pessoal')) {
    test(`infinitivo-pessoal: ${item.id}`, async ({ page }) => {
      await waitReady(page)
      await evaluateCase(page, item)
    })
  }
})
