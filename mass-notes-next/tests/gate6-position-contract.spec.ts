import { expect, test, type Page } from '@playwright/test'

type BrowserRange = {
  from: number
  to: number
  collapsed: boolean
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

type BrowserSegment = {
  kind: 'text' | 'hardBreak' | 'atom' | 'blockSeparator'
  textFrom: number
  textTo: number
  pmFrom: number
  pmTo: number
}

type BrowserSnapshot = {
  version: number
  documentId: string
  contentSignature: string
  offsetEncoding: string
  blockSeparator: string
  hardBreak: string
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

type ContractHost = HTMLElement & {
  __escrevaralPositionContract?: BrowserContract
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

async function pasteStructuredText(page: Page, html: string, plain: string) {
  await page.locator('.ProseMirror').evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })
}

async function waitContractText(page: Page, text: string) {
  await expect.poll(() => page.locator('.ProseMirror').evaluate((element) =>
    (element as ContractHost).__escrevaralPositionContract?.snapshot.text ?? null)).toBe(text)
}

async function readSnapshot(page: Page): Promise<BrowserSnapshot> {
  return page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato de posições ausente.')
    return contract.snapshot
  })
}

test('documento vazio possui âncora estável sem inventar conteúdo', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Contrato vazio')
  await waitContractText(page, '')

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const block = contract.snapshot.blocks[0]
    return {
      snapshot: contract.snapshot,
      position: contract.textOffsetToPosition(0),
      offset: contract.positionToTextOffset(block.pmFrom),
      range: contract.textRangeToPositionRange({ from: 0, to: 0 }),
    }
  })

  expect(result.snapshot.text).toBe('')
  expect(result.snapshot.offsetEncoding).toBe('utf-16')
  expect(result.snapshot.blocks).toHaveLength(1)
  expect(result.snapshot.blocks[0].empty).toBe(true)
  expect(result.position).toBe(result.snapshot.blocks[0].pmFrom)
  expect(result.offset).toBe(0)
  expect(result.range.collapsed).toBe(true)
})

test('acentos e emoji preservam unidades UTF-16 e round-trip', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Unicode estrutural')
  const expected = 'Árvore 🌿\n\ncafé'
  await pasteStructuredText(page, '<h2>Árvore 🌿</h2><p>café</p>', expected)
  await waitContractText(page, expected)

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const text = contract.snapshot.text
    const emojiFrom = text.indexOf('🌿')
    const emojiTo = emojiFrom + '🌿'.length
    const accentFrom = text.indexOf('café')
    const accentTo = accentFrom + 'café'.length
    const emojiPosition = contract.textRangeToPositionRange({ from: emojiFrom, to: emojiTo })
    const emojiRoundTrip = contract.positionRangeToTextRange(emojiPosition)
    const accentPosition = contract.textRangeToPositionRange({ from: accentFrom, to: accentTo })
    const accentRoundTrip = contract.positionRangeToTextRange(accentPosition)
    return {
      encoding: contract.snapshot.offsetEncoding,
      emojiUnits: '🌿'.length,
      emojiFrom,
      emojiTo,
      emojiPosition,
      emojiRoundTrip,
      accentFrom,
      accentTo,
      accentPosition,
      accentRoundTrip,
    }
  })

  expect(result.encoding).toBe('utf-16')
  expect(result.emojiUnits).toBe(2)
  expect(result.emojiPosition.to - result.emojiPosition.from).toBe(2)
  expect(result.emojiRoundTrip).toMatchObject({ from: result.emojiFrom, to: result.emojiTo, collapsed: false })
  expect(result.accentPosition.to - result.accentPosition.from).toBe('café'.length)
  expect(result.accentRoundTrip).toMatchObject({ from: result.accentFrom, to: result.accentTo, collapsed: false })
})

test('separador virtual respeita afinidade e range exclusivamente virtual colapsa', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Afinidade entre blocos')
  const expected = 'Título\n\ncorpo'
  await pasteStructuredText(page, '<h2>Título</h2><p>corpo</p>', expected)
  await waitContractText(page, expected)

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const separatorFrom = contract.snapshot.text.indexOf('\n\n')
    const middle = separatorFrom + 1
    const backward = contract.textOffsetToPosition(middle, 'backward')
    const forward = contract.textOffsetToPosition(middle, 'forward')
    return {
      separatorFrom,
      backward,
      forward,
      backwardOffset: contract.positionToTextOffset(backward, 'backward'),
      forwardOffset: contract.positionToTextOffset(forward, 'forward'),
      virtualRange: contract.textRangeToPositionRange({ from: separatorFrom, to: separatorFrom + 2 }),
    }
  })

  expect(result.backward).toBeLessThan(result.forward)
  expect(result.backwardOffset).toBe(result.separatorFrom)
  expect(result.forwardOffset).toBe(result.separatorFrom + 2)
  expect(result.virtualRange.collapsed).toBe(true)
  expect(result.virtualRange.from).toBe(result.virtualRange.to)
})

test('hardBreak é texto derivado real com largura ProseMirror unitária', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Quebra interna')
  const expected = 'linha um\nlinha dois'
  await pasteStructuredText(page, '<p>linha um<br>linha dois</p>', expected)
  await waitContractText(page, expected)

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const offset = contract.snapshot.text.indexOf('\n')
    const segment = contract.snapshot.segments.find((entry) => entry.kind === 'hardBreak')
    const positionRange = contract.textRangeToPositionRange({ from: offset, to: offset + 1 })
    const textRange = contract.positionRangeToTextRange(positionRange)
    return { offset, segment, positionRange, textRange }
  })

  expect(result.segment).toBeTruthy()
  expect((result.segment?.pmTo ?? 0) - (result.segment?.pmFrom ?? 0)).toBe(1)
  expect(result.positionRange.to - result.positionRange.from).toBe(1)
  expect(result.textRange).toMatchObject({ from: result.offset, to: result.offset + 1, collapsed: false })
})

test('títulos e listas mantêm ordem monotônica através de wrappers', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Estrutura aninhada')
  const expected = 'Título\n\nprimeiro\n\nsegundo\n\n'
  await pasteStructuredText(page, '<h3>Título</h3><ul><li>primeiro</li><li>segundo</li></ul>', expected)
  await waitContractText(page, expected)

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const words = ['Título', 'primeiro', 'segundo']
    const ranges = words.map((word) => {
      const from = contract.snapshot.text.indexOf(word)
      return contract.textRangeToPositionRange({ from, to: from + word.length })
    })
    return {
      text: contract.snapshot.text,
      blocks: contract.snapshot.blocks,
      ranges,
      signature: contract.snapshot.contentSignature,
    }
  })

  expect(result.text).toBe(expected)
  expect(result.blocks.map((block) => block.nodeType)).toEqual(['heading', 'paragraph', 'paragraph', 'paragraph'])
  expect(result.blocks.at(-1)).toMatchObject({ empty: true })
  expect(result.ranges[0].to).toBeLessThan(result.ranges[1].from)
  expect(result.ranges[1].to).toBeLessThan(result.ranges[2].from)
  expect(result.signature).toMatch(/^pm-json-v1-[0-9a-f]{8}-\d+$/)
})

test('bloco vazio mantém âncora entre separadores consecutivos', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Bloco vazio')
  const expected = 'a\n\n\n\nb'
  await pasteStructuredText(page, '<p>a</p><p></p><p>b</p>', expected)
  await waitContractText(page, expected)

  const result = await page.locator('.ProseMirror').evaluate((element) => {
    const contract = (element as ContractHost).__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const middle = contract.snapshot.blocks[1]
    return {
      blocks: contract.snapshot.blocks,
      separators: contract.snapshot.segments.filter((segment) => segment.kind === 'blockSeparator'),
      mappedPosition: contract.textOffsetToPosition(middle.textFrom),
      mappedOffset: contract.positionToTextOffset(middle.pmFrom),
    }
  })

  expect(result.blocks).toHaveLength(3)
  expect(result.blocks[1]).toMatchObject({ empty: true, textFrom: 3, textTo: 3 })
  expect(result.separators).toHaveLength(2)
  expect(result.mappedPosition).toBe(result.blocks[1].pmFrom)
  expect(result.mappedOffset).toBe(3)
})

test('assinatura estrutural muda quando o mesmo texto vira título', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Assinatura estrutural')
  await editor.fill('Mesmo texto')
  await waitContractText(page, 'Mesmo texto')
  const before = await readSnapshot(page)

  await editor.click()
  await page.keyboard.press('Home')
  await page.getByRole('button', { name: 'T1', exact: true }).click()
  await expect.poll(async () => (await readSnapshot(page)).contentSignature).not.toBe(before.contentSignature)
  const after = await readSnapshot(page)

  expect(after.text.replace(/\n+$/, '')).toBe(before.text)
  expect(before.blocks).toHaveLength(1)
  expect(before.blocks[0].nodeType).toBe('paragraph')
  expect(after.blocks).toHaveLength(2)
  expect(after.blocks[0].nodeType).toBe('heading')
  expect(after.blocks[1]).toMatchObject({ nodeType: 'paragraph', empty: true })
  expect(after.contentSignature).not.toBe(before.contentSignature)
})

test('identidade do documento é separada da assinatura do mesmo conteúdo', async ({ page }) => {
  await waitReady(page)
  const firstEditor = await createCleanDocument(page, 'Documento A')
  await firstEditor.fill('conteúdo igual')
  await waitContractText(page, 'conteúdo igual')
  const first = await readSnapshot(page)

  const secondEditor = await createCleanDocument(page, 'Documento B')
  await secondEditor.fill('conteúdo igual')
  await waitContractText(page, 'conteúdo igual')
  const second = await readSnapshot(page)

  expect(second.documentId).not.toBe(first.documentId)
  expect(second.contentSignature).toBe(first.contentSignature)
  expect(second.text).toBe(first.text)
})

test('clamp, ranges invertidos e consultas permanecem puros', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Pureza do contrato')
  await pasteStructuredText(page, '<p><strong>Texto</strong> estável</p>', 'Texto estável')
  await waitContractText(page, 'Texto estável')

  await editor.click()
  await page.keyboard.press('Home')
  await page.keyboard.down('Shift')
  for (let index = 0; index < 5; index += 1) await page.keyboard.press('ArrowRight')
  await page.keyboard.up('Shift')

  const before = await editor.evaluate((element) => ({
    html: element.innerHTML,
    selectedText: window.getSelection()?.toString() ?? '',
  }))

  const result = await editor.evaluate((element) => {
    const host = element as ContractHost
    const contract = host.__escrevaralPositionContract
    if (!contract) throw new Error('Contrato ausente.')
    const first = contract.snapshot.blocks[0]
    const reversed = contract.textRangeToPositionRange({ from: contract.snapshot.text.length, to: 0 })
    const roundTrip = contract.positionRangeToTextRange(reversed)

    for (let offset = -5; offset <= contract.snapshot.text.length + 5; offset += 1) {
      contract.textOffsetToPosition(offset, offset % 2 ? 'backward' : 'forward')
    }

    return {
      first,
      lowText: contract.textOffsetToPosition(-100),
      highText: contract.textOffsetToPosition(100_000),
      lowPosition: contract.positionToTextOffset(-100),
      highPosition: contract.positionToTextOffset(100_000),
      reversed,
      roundTrip,
      html: element.innerHTML,
      selectedText: window.getSelection()?.toString() ?? '',
      decorations: element.querySelectorAll('[data-position-decoration], .position-decoration, .position-contract-decoration').length,
    }
  })

  expect(result.lowText).toBe(result.first.pmFrom)
  expect(result.highText).toBe(result.first.pmTo)
  expect(result.lowPosition).toBe(0)
  expect(result.highPosition).toBe('Texto estável'.length)
  expect(result.reversed.collapsed).toBe(false)
  expect(result.roundTrip).toMatchObject({ from: 0, to: 'Texto estável'.length, collapsed: false })
  expect(result.html).toBe(before.html)
  expect(result.selectedText).toBe(before.selectedText)
  expect(result.selectedText).toBe('Texto')
  expect(result.decorations).toBe(0)
})
