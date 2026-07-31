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
  return editor
}

async function consult(page: Page, query: string) {
  await page.getByLabel('Palavra ou expressão curta').fill(query)
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.getByRole('status')).toContainText(/concluída|não encontrei|não pôde/iu)
}

async function primaryText(card: Locator): Promise<string> {
  const heading = card.locator('.verb-formation-heading')
  const classification = card.locator('.verb-formation-section').filter({
    has: card.getByRole('heading', { name: 'Classificação', exact: true }),
  })
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

  if (count === 0) return
  const value = await primaryText(card)
  expect(value).not.toContain(item.targetLabel)
  for (const expected of item.includes) expect(value).toContain(expected)
  for (const excluded of item.excludes) expect(value).not.toContain(excluded)
}

async function evaluateGeneralCase(card: Locator, item: EvaluationCase) {
  if (item.shouldFind) {
    await expect(card).toBeVisible()
    for (const expected of item.includes) await expect(card).toContainText(expected)
    for (const excluded of item.excludes) await expect(card).not.toContainText(excluded)
  } else {
    await expect(card).toHaveCount(0)
  }
}

async function evaluateCase(page: Page, item: EvaluationCase) {
  const editor = await setManuscript(page, item.manuscript)
  const htmlBefore = await editor.innerHTML()
  await consult(page, item.query)
  const card = page.locator('[data-verb-analysis]')

  if (typeof item.targetExpected === 'boolean' && item.targetLabel) {
    await evaluateTargetCase(card, item)
  } else {
    await evaluateGeneralCase(card, item)
  }

  expect(await editor.innerHTML()).toBe(htmlBefore)
}

test.describe('banca E2-V adversarial fora do gate de regressão', () => {
  test.beforeEach(async ({ page }) => {
    await waitReady(page)
  })

  for (const item of evaluation.cases) {
    test(`${item.phenomenon}: ${item.id}`, async ({ page }) => {
      test.setTimeout(45_000)
      await evaluateCase(page, item)
    })
  }
})
