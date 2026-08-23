import { test as base } from 'playwright/test'

export * from 'playwright/test'

type Page = import('playwright/test').Page
type BrowserContext = import('playwright/test').BrowserContext

const wrappedContexts = new WeakSet<BrowserContext>()

async function openWorkshopAfterNavigation(page: Page) {
  const viewport = page.viewportSize()
  if (viewport && viewport.width <= 820) return

  let pathname = ''
  try {
    pathname = new URL(page.url()).pathname
  } catch {
    return
  }
  if (pathname !== '/') return

  const opener = page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })
  try {
    await opener.waitFor({ state: 'visible', timeout: 5_000 })
  } catch {
    return
  }

  await opener.click()
  await page.waitForFunction(() => document.body.classList.contains('workshop-open'))
}

function installWorkshopNavigationContract(page: Page) {
  const rawGoto = page.goto.bind(page)
  const rawReload = page.reload.bind(page)
  const rawGoBack = page.goBack.bind(page)
  const rawGoForward = page.goForward.bind(page)

  page.goto = (async (url, options) => {
    const response = await rawGoto(url, options)
    await openWorkshopAfterNavigation(page)
    return response
  }) as Page['goto']

  page.reload = (async (options) => {
    const response = await rawReload(options)
    await openWorkshopAfterNavigation(page)
    return response
  }) as Page['reload']

  page.goBack = (async (options) => {
    const response = await rawGoBack(options)
    await openWorkshopAfterNavigation(page)
    return response
  }) as Page['goBack']

  page.goForward = (async (options) => {
    const response = await rawGoForward(options)
    await openWorkshopAfterNavigation(page)
    return response
  }) as Page['goForward']
}

function installWorkshopContextContract(context: BrowserContext) {
  if (wrappedContexts.has(context)) return
  wrappedContexts.add(context)

  const rawNewPage = context.newPage.bind(context)
  context.newPage = (async () => {
    const page = await rawNewPage()
    installWorkshopNavigationContract(page)
    return page
  }) as BrowserContext['newPage']
}

export const test = base.extend({
  page: async ({ page }, use) => {
    installWorkshopNavigationContract(page)
    installWorkshopContextContract(page.context())
    await use(page)
  },
})
