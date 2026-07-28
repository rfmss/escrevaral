import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { positionAuditCorpora, type PositionAuditTarget } from './fixtures/position-audit-corpora'

type BrowserRange = { from: number; to: number; collapsed: boolean }
type BrowserSegment = {
  kind: 'text' | 'hardBreak' | 'atom' | 'blockSeparator'
  textFrom: number
  textTo: number
  pmFrom: number
  pmTo: number
}
type BrowserBlock = {
  index: number
  nodeType: string
  textFrom: number
  textTo: number
  pmFrom: number
  pmTo: number
  empty: boolean
}
type BrowserSnapshot = {
  version: number
  documentId: string
  contentSignature: string
  offsetEncoding: string
  text: string
  docSize: number
  blocks: BrowserBlock[]
  segments: BrowserSegment[]
}
type BrowserContract = {
  snapshot: BrowserSnapshot
  textOffsetToPosition: (offset: number, affinity?: 'backward' | 'forward') => number
  positionToTextOffset: (position: number, affinity?: 'backward' | 'forward') => number
  textRangeToPositionRange: (range: { from: number; to: number }) => BrowserRange
  positionRangeToTextRange: (range: { from: number; to: number }) => BrowserRange
}
type ContractHost = HTMLElement & { __escrevaralPositionContract?: BrowserContract }

type AuditRecord = {
  label: string
  expected: string
  from: number
  to: number
  pmFrom: number
  pmTo: number
  expectedPmFrom: number
  expectedPmTo: number
  recovered: string
  roundTrip: BrowserRange
  blocks: string[]
}

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect.poll(() => page.locator('.ProseMirror').evaluate((element) =>
    Boolean((element as ContractHost).__escrevaralPositionContract))).toBe(true)
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await expect(page.getByLabel('Título do documento')).toHaveValue('')
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function pasteStructuredText(page: Page, html: string, plain = '') {
  await page.locator('.ProseMirror').evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })
}

async function waitContractMatchesDom(page: Page) {
  await expect.poll(() => page.locator('.ProseMirror').evaluate((element) => {
    const host = element as ContractHost
    const contractText = host.__escrevaralPositionContract?.snapshot.text
    if (contractText === undefined) return false

    const readNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ?? ''
      if (node instanceof HTMLBRElement) {
        if (node.classList.contains('ProseMirror-trailingBreak') || node.classList.contains('ProseMirror-separator')) return ''
        return '\n'
      }
      return Array.from(node.childNodes).map(readNode).join('')
    }

    const blocks = Array.from(element.querySelectorAll('p, h1, h2, h3'))
    const domText = blocks.map(readNode).join('\n\n')
    return contractText === domText
  })).toBe(true)
}

async function auditTargets(page: Page, targets: PositionAuditTarget[]) {
  return page.locator('.ProseMirror').evaluate((element, requestedTargets) => {
    const host = element as ContractHost
    const contract = host.__escrevaralPositionContract
    if (!contract) throw new Error('Contrato de posições ausente.')

    const nthIndexOf = (text: string, needle: string, occurrence = 0) => {
      let cursor = -1
      for (let index = 0; index <= occurrence; index += 1) {
        cursor = text.indexOf(needle, cursor + 1)
        if (cursor < 0) return -1
      }
      return cursor
    }

    const readNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ?? ''
      if (node instanceof HTMLBRElement) {
        if (node.classList.contains('ProseMirror-trailingBreak') || node.classList.contains('ProseMirror-separator')) return ''
        return '\n'
      }
      return Array.from(node.childNodes).map(readNode).join('')
    }

    const domText = Array.from(element.querySelectorAll('p, h1, h2, h3')).map(readNode).join('\n\n')
    const records = requestedTargets.map((target) => {
      const from = nthIndexOf(contract.snapshot.text, target.value, target.occurrence ?? 0)
      if (from < 0) throw new Error(`Trecho ausente: ${target.label} — ${JSON.stringify(target.value)}`)
      const to = from + target.value.length
      const editable = contract.snapshot.segments.filter((segment) =>
        segment.kind !== 'blockSeparator' && segment.textTo > from && segment.textFrom < to)
      if (!editable.length) throw new Error(`Trecho sem segmento editável: ${target.label}`)

      const first = editable[0]
      const last = editable[editable.length - 1]
      const expectedPmFrom = first.pmFrom + Math.max(0, from - first.textFrom)
      const expectedPmTo = last.pmFrom + Math.min(last.textTo, to) - last.textFrom
      const positionRange = contract.textRangeToPositionRange({ from, to })
      const roundTrip = contract.positionRangeToTextRange(positionRange)
      const recovered = contract.snapshot.text.slice(roundTrip.from, roundTrip.to)
      const blocks = contract.snapshot.blocks
        .filter((block) => block.textTo > from && block.textFrom < to)
        .map((block) => `${block.index}:${block.nodeType}${block.empty ? ':empty' : ''}`)

      return {
        label: target.label,
        expected: target.value,
        from,
        to,
        pmFrom: positionRange.from,
        pmTo: positionRange.to,
        expectedPmFrom,
        expectedPmTo,
        recovered,
        roundTrip,
        blocks,
      }
    })

    return {
      snapshot: contract.snapshot,
      domText,
      records,
      html: element.innerHTML,
    }
  }, targets) as Promise<{ snapshot: BrowserSnapshot; domText: string; records: AuditRecord[]; html: string }>
}

async function attachAudit(testInfo: TestInfo, name: string, payload: unknown) {
  await testInfo.attach(name, {
    body: Buffer.from(JSON.stringify(payload, null, 2), 'utf8'),
    contentType: 'application/json',
  })
}

for (const corpus of positionAuditCorpora) {
  test(`auditoria editorial: ${corpus.id}`, async ({ page, browserName }, testInfo) => {
    await waitReady(page)
    await createCleanDocument(page, corpus.title)
    await pasteStructuredText(page, corpus.html)
    await waitContractMatchesDom(page)

    const result = await auditTargets(page, corpus.targets)
    expect(result.snapshot.offsetEncoding).toBe('utf-16')
    expect(result.snapshot.text).toBe(result.domText)
    expect(result.snapshot.contentSignature).toMatch(/^pm-json-v1-[0-9a-f]{8}-\d+$/)

    for (const record of result.records) {
      expect(record.pmFrom, `${record.label}: início ProseMirror`).toBe(record.expectedPmFrom)
      expect(record.pmTo, `${record.label}: fim ProseMirror`).toBe(record.expectedPmTo)
      expect(record.roundTrip, `${record.label}: round-trip`).toEqual({ from: record.from, to: record.to, collapsed: false })
      expect(record.recovered, `${record.label}: trecho recuperado`).toBe(record.expected)
    }

    await attachAudit(testInfo, `gate6-9-${corpus.id}-${browserName}.json`, {
      corpus: corpus.id,
      browser: browserName,
      documentId: result.snapshot.documentId,
      signature: result.snapshot.contentSignature,
      offsetEncoding: result.snapshot.offsetEncoding,
      textLength: result.snapshot.text.length,
      docSize: result.snapshot.docSize,
      blocks: result.snapshot.blocks,
      records: result.records,
    })
  })
}

test('listas aninhadas, citações e fronteiras preservam monotonicidade e afinidade', async ({ page, browserName }, testInfo) => {
  await waitReady(page)
  await createCleanDocument(page, 'Monotonicidade estrutural')
  const corpus = positionAuditCorpora.find((entry) => entry.id === 'ensaio-estrutura')!
  await pasteStructuredText(page, corpus.html)
  await waitContractMatchesDom(page)

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')

    const editableRoundTrips = contract.snapshot.segments
      .filter((segment) => segment.kind !== 'blockSeparator')
      .map((segment) => {
        const range = contract.textRangeToPositionRange({ from: segment.textFrom, to: segment.textTo })
        return {
          segment,
          range,
          roundTrip: contract.positionRangeToTextRange(range),
        }
      })

    const separators = contract.snapshot.segments
      .filter((segment) => segment.kind === 'blockSeparator')
      .map((segment) => {
        const middle = segment.textFrom + 1
        const backward = contract.textOffsetToPosition(middle, 'backward')
        const forward = contract.textOffsetToPosition(middle, 'forward')
        return {
          segment,
          backward,
          forward,
          backwardOffset: contract.positionToTextOffset(backward, 'backward'),
          forwardOffset: contract.positionToTextOffset(forward, 'forward'),
          virtual: contract.textRangeToPositionRange({ from: segment.textFrom, to: segment.textTo }),
        }
      })

    const monotonic = (affinity: 'backward' | 'forward') => {
      const values = Array.from({ length: contract.snapshot.docSize + 1 }, (_, position) =>
        contract.positionToTextOffset(position, affinity))
      return values.every((value, index) => index === 0 || value >= values[index - 1])
    }

    return {
      snapshot: contract.snapshot,
      editableRoundTrips,
      separators,
      backwardMonotonic: monotonic('backward'),
      forwardMonotonic: monotonic('forward'),
    }
  })

  expect(result.backwardMonotonic).toBe(true)
  expect(result.forwardMonotonic).toBe(true)
  for (const item of result.editableRoundTrips) {
    expect(item.roundTrip).toEqual({ from: item.segment.textFrom, to: item.segment.textTo, collapsed: item.segment.textFrom === item.segment.textTo })
  }
  for (const item of result.separators) {
    expect(item.backward).toBeLessThanOrEqual(item.forward)
    expect(item.backwardOffset).toBe(item.segment.textFrom)
    expect(item.forwardOffset).toBe(item.segment.textTo)
    expect(item.virtual.collapsed).toBe(true)
  }

  await attachAudit(testInfo, `gate6-9-monotonicidade-${browserName}.json`, result)
})

test('documento extenso mantém alvos no início, meio e fim', async ({ page, browserName }, testInfo) => {
  await waitReady(page)
  await createCleanDocument(page, 'Caderno extenso')

  const paragraphs = Array.from({ length: 180 }, (_, index) => {
    const number = String(index + 1).padStart(3, '0')
    return `<p>Parágrafo ${number} — Em uma cidade brasileira, a escrita atravessa ônibus, feira, quintal e janela sem perder o endereço da própria voz.</p>`
  })
  paragraphs[89] = '<p>Parágrafo 090 — No meio do caderno, Conceição marcou a frase com um círculo e escreveu: “voltar depois do café”.</p>'
  paragraphs[179] = '<p>Parágrafo 180 — Perto do fim, a palavra jabuticaba encontrou o emoji 🌳 e permaneceu exatamente no lugar esperado.</p>'
  const html = `<h2>Caderno de cento e oitenta passagens</h2>${paragraphs.join('')}`
  await pasteStructuredText(page, html)
  await waitContractMatchesDom(page)

  const targets: PositionAuditTarget[] = [
    { label: 'início extenso', value: 'Caderno de cento e oitenta passagens' },
    { label: 'meio extenso', value: 'Conceição marcou a frase com um círculo' },
    { label: 'aspas no meio', value: '“voltar depois do café”' },
    { label: 'fim extenso', value: 'a palavra jabuticaba encontrou o emoji 🌳' },
  ]
  const result = await auditTargets(page, targets)
  expect(result.snapshot.text.length).toBeGreaterThan(20_000)
  expect(result.snapshot.blocks.length).toBe(181)
  for (const record of result.records) {
    expect(record.pmFrom).toBe(record.expectedPmFrom)
    expect(record.pmTo).toBe(record.expectedPmTo)
    expect(record.recovered).toBe(record.expected)
    expect(record.roundTrip).toEqual({ from: record.from, to: record.to, collapsed: false })
  }

  await attachAudit(testInfo, `gate6-9-documento-extenso-${browserName}.json`, {
    browser: browserName,
    textLength: result.snapshot.text.length,
    docSize: result.snapshot.docSize,
    blockCount: result.snapshot.blocks.length,
    records: result.records,
  })
})

test('auditoria intensiva não altera HTML, seleção nem cria decorations', async ({ page, browserName }, testInfo) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Pureza editorial')
  const corpus = positionAuditCorpora.find((entry) => entry.id === 'prosa-dialogo')!
  await pasteStructuredText(page, corpus.html)
  await waitContractMatchesDom(page)

  await editor.click()
  await page.keyboard.press('Home')
  await page.keyboard.down('Shift')
  for (let index = 0; index < 18; index += 1) await page.keyboard.press('ArrowRight')
  await page.keyboard.up('Shift')

  const before = await editor.evaluate((element) => ({
    html: element.innerHTML,
    selectedText: window.getSelection()?.toString() ?? '',
  }))

  const after = await editor.evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')

    for (let cycle = 0; cycle < 40; cycle += 1) {
      for (let offset = 0; offset <= contract.snapshot.text.length; offset += 1) {
        const affinity = (offset + cycle) % 2 ? 'backward' : 'forward'
        contract.textOffsetToPosition(offset, affinity)
      }
      for (let position = 0; position <= contract.snapshot.docSize; position += 1) {
        const affinity = (position + cycle) % 2 ? 'backward' : 'forward'
        contract.positionToTextOffset(position, affinity)
      }
    }

    return {
      html: element.innerHTML,
      selectedText: window.getSelection()?.toString() ?? '',
      decorations: element.querySelectorAll('[data-position-decoration], .position-decoration, .position-contract-decoration').length,
      signature: contract.snapshot.contentSignature,
    }
  })

  expect(after.html).toBe(before.html)
  expect(after.selectedText).toBe(before.selectedText)
  expect(after.selectedText.length).toBeGreaterThan(0)
  expect(after.decorations).toBe(0)
  await attachAudit(testInfo, `gate6-9-pureza-${browserName}.json`, { browser: browserName, before, after })
})
