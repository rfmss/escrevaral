import { expect, test, type Page } from '@playwright/test'
import evaluation from '../fixtures/verb-morphology-evaluation.json'

type EvaluationCase = (typeof evaluation.cases)[number]

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

async function evaluateCase(page: Page, item: EvaluationCase) {
  await test.step(`${item.phenomenon}: ${item.id}`, async () => {
    const editor = await setManuscript(page, item.manuscript)
    const htmlBefore = await editor.innerHTML()
    await consult(page, item.query)
    const card = page.locator('[data-verb-analysis]')

    if (item.shouldFind) {
      await expect(card).toBeVisible()
      for (const expected of item.includes) await expect(card).toContainText(expected)
      for (const excluded of item.excludes) await expect(card).not.toContainText(excluded)
    } else {
      await expect(card).toHaveCount(0)
    }

    expect(await editor.innerHTML()).toBe(htmlBefore)
  })
}

test('banca E2-V adversarial mede fenômenos sem integrar o gate de regressão', async ({ page }) => {
  test.setTimeout(180_000)
  await waitReady(page)
  for (const item of evaluation.cases) await evaluateCase(page, item)
})
