import { expect, test, type Page } from '@playwright/test'

const CASES = [
  {
    key: 'algures',
    manuscript: 'A carta estava algures entre os papéis.',
    definition: "Advérbio de lugar: 'em algum lugar', 'em alguma parte'. Indica um lugar que não se sabe ou não se quer nomear diretamente; em sentido estrito, refere-se ao espaço, não ao tempo.",
  },
  {
    key: 'outrora',
    manuscript: 'Outrora, a estação recebia trens todas as manhãs.',
    definition: "Advérbio de tempo: 'noutro tempo', 'antigamente', 'em tempos passados'. Situa algo em período anterior, sem exigir data precisa; pode produzir tom retrospectivo ou historicizante.",
  },
] as const

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

async function openWords(page: Page) {
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

for (const lexicalCase of CASES) {
  test(`E2 apresenta a definição consolidada de ${lexicalCase.key} sem alterar o manuscrito`, async ({ page }) => {
    await waitReady(page)
    const editor = page.getByLabel('Texto do documento')
    await editor.fill(lexicalCase.manuscript)
    const before = await editor.evaluate((element) => element.innerHTML)

    await openWords(page)
    await page.getByLabel('Palavra ou expressão curta').fill(lexicalCase.key)
    await page.getByRole('button', { name: 'Consultar' }).click()

    await expect(page.getByRole('status')).toContainText(/leitura lexical concluída/i)
    const reading = page.locator('.lexical-reading')
    await expect(reading).toBeVisible()
    await expect(reading.locator('.lexical-definition')).toHaveText(lexicalCase.definition)
    await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
    expect(await editor.evaluate((element) => element.innerHTML)).toBe(before)
  })
}
