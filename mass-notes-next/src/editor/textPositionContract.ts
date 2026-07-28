import type { JSONContent } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

export type PositionAffinity = 'backward' | 'forward'
export type PositionSegmentKind = 'text' | 'hardBreak' | 'atom' | 'blockSeparator'

export type TextPositionSegment = {
  kind: PositionSegmentKind
  textFrom: number
  textTo: number
  pmFrom: number
  pmTo: number
}

export type TextBlockPosition = {
  index: number
  nodeType: string
  textFrom: number
  textTo: number
  pmFrom: number
  pmTo: number
  empty: boolean
}

export type PositionRange = {
  from: number
  to: number
  collapsed: boolean
}

export type TextPositionSnapshot = {
  version: 1
  documentId: string
  contentSignature: string
  offsetEncoding: 'utf-16'
  blockSeparator: '\n\n'
  hardBreak: '\n'
  text: string
  docSize: number
  blocks: TextBlockPosition[]
  segments: TextPositionSegment[]
}

export type EditorPositionContract = {
  snapshot: TextPositionSnapshot
  textOffsetToPosition: (offset: number, affinity?: PositionAffinity) => number
  positionToTextOffset: (position: number, affinity?: PositionAffinity) => number
  textRangeToPositionRange: (range: { from: number; to: number }) => PositionRange
  positionRangeToTextRange: (range: { from: number; to: number }) => PositionRange
}

type BlockSource = {
  node: ProseMirrorNode
  position: number
}

const BLOCK_SEPARATOR = '\n\n' as const
const HARD_BREAK = '\n' as const
const OBJECT_REPLACEMENT = '\uFFFC'

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum
  return Math.min(maximum, Math.max(minimum, Math.trunc(value)))
}

function stableSerialize(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

export function createContentSignature(content: JSONContent): string {
  const serialized = stableSerialize(content)
  let hash = 0x811c9dc5

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return `pm-json-v1-${(hash >>> 0).toString(16).padStart(8, '0')}-${serialized.length}`
}

function collectTextBlocks(documentNode: ProseMirrorNode): BlockSource[] {
  const blocks: BlockSource[] = []

  documentNode.descendants((node, position) => {
    if (!node.isTextblock) return true
    blocks.push({ node, position })
    return false
  })

  return blocks
}

function appendInlineContent(
  node: ProseMirrorNode,
  nodePosition: number,
  chunks: string[],
  segments: TextPositionSegment[],
  cursor: { value: number },
): void {
  node.forEach((child, offset) => {
    const childPosition = nodePosition + 1 + offset

    if (child.isText) {
      const value = child.text ?? ''
      if (!value) return
      chunks.push(value)
      segments.push({
        kind: 'text',
        textFrom: cursor.value,
        textTo: cursor.value + value.length,
        pmFrom: childPosition,
        pmTo: childPosition + child.nodeSize,
      })
      cursor.value += value.length
      return
    }

    if (child.type.name === 'hardBreak') {
      chunks.push(HARD_BREAK)
      segments.push({
        kind: 'hardBreak',
        textFrom: cursor.value,
        textTo: cursor.value + HARD_BREAK.length,
        pmFrom: childPosition,
        pmTo: childPosition + child.nodeSize,
      })
      cursor.value += HARD_BREAK.length
      return
    }

    if (child.isInline && child.isLeaf) {
      chunks.push(OBJECT_REPLACEMENT)
      segments.push({
        kind: 'atom',
        textFrom: cursor.value,
        textTo: cursor.value + OBJECT_REPLACEMENT.length,
        pmFrom: childPosition,
        pmTo: childPosition + child.nodeSize,
      })
      cursor.value += OBJECT_REPLACEMENT.length
      return
    }

    if (child.childCount > 0) {
      appendInlineContent(child, childPosition, chunks, segments, cursor)
    }
  })
}

export function createTextPositionSnapshot(
  documentNode: ProseMirrorNode,
  documentId: string,
  content: JSONContent,
): TextPositionSnapshot {
  const chunks: string[] = []
  const segments: TextPositionSegment[] = []
  const blocks: TextBlockPosition[] = []
  const blockSources = collectTextBlocks(documentNode)
  const cursor = { value: 0 }

  blockSources.forEach((source, index) => {
    const pmFrom = source.position + 1
    const pmTo = source.position + source.node.nodeSize - 1
    const previous = blocks[index - 1]

    if (previous) {
      chunks.push(BLOCK_SEPARATOR)
      segments.push({
        kind: 'blockSeparator',
        textFrom: cursor.value,
        textTo: cursor.value + BLOCK_SEPARATOR.length,
        pmFrom: previous.pmTo,
        pmTo: pmFrom,
      })
      cursor.value += BLOCK_SEPARATOR.length
    }

    const textFrom = cursor.value
    appendInlineContent(source.node, source.position, chunks, segments, cursor)

    blocks.push({
      index,
      nodeType: source.node.type.name,
      textFrom,
      textTo: cursor.value,
      pmFrom,
      pmTo,
      empty: textFrom === cursor.value,
    })
  })

  return {
    version: 1,
    documentId,
    contentSignature: createContentSignature(content),
    offsetEncoding: 'utf-16',
    blockSeparator: BLOCK_SEPARATOR,
    hardBreak: HARD_BREAK,
    text: chunks.join(''),
    docSize: documentNode.content.size,
    blocks,
    segments,
  }
}

function findSegmentByTextOffset(snapshot: TextPositionSnapshot, offset: number): TextPositionSegment | null {
  for (const segment of snapshot.segments) {
    if (offset < segment.textFrom) return null
    if (offset <= segment.textTo) return segment
  }
  return null
}

function findEmptyBlockAtPosition(snapshot: TextPositionSnapshot, position: number): TextBlockPosition | null {
  return snapshot.blocks.find((block) => block.empty && block.pmFrom === position) ?? null
}

export function textOffsetToPosition(
  snapshot: TextPositionSnapshot,
  requestedOffset: number,
  affinity: PositionAffinity = 'forward',
): number {
  const offset = clamp(requestedOffset, 0, snapshot.text.length)
  const segment = findSegmentByTextOffset(snapshot, offset)

  if (segment) {
    if (segment.kind !== 'blockSeparator') {
      return clamp(segment.pmFrom + (offset - segment.textFrom), segment.pmFrom, segment.pmTo)
    }

    if (offset <= segment.textFrom) return segment.pmFrom
    if (offset >= segment.textTo) return segment.pmTo
    return affinity === 'backward' ? segment.pmFrom : segment.pmTo
  }

  if (!snapshot.blocks.length) return 0
  if (offset <= 0) return snapshot.blocks[0].pmFrom
  return snapshot.blocks[snapshot.blocks.length - 1].pmTo
}

export function positionToTextOffset(
  snapshot: TextPositionSnapshot,
  requestedPosition: number,
  affinity: PositionAffinity = 'forward',
): number {
  const position = clamp(requestedPosition, 0, snapshot.docSize)
  const emptyBlock = findEmptyBlockAtPosition(snapshot, position)
  if (emptyBlock) return emptyBlock.textFrom

  for (const segment of snapshot.segments) {
    if (segment.kind !== 'blockSeparator') {
      if (position >= segment.pmFrom && position <= segment.pmTo) {
        return clamp(segment.textFrom + (position - segment.pmFrom), segment.textFrom, segment.textTo)
      }
      continue
    }

    const minimum = Math.min(segment.pmFrom, segment.pmTo)
    const maximum = Math.max(segment.pmFrom, segment.pmTo)
    if (position < minimum || position > maximum) continue
    if (position === segment.pmFrom) return segment.textFrom
    if (position === segment.pmTo) return segment.textTo
    return affinity === 'backward' ? segment.textFrom : segment.textTo
  }

  if (!snapshot.blocks.length) return 0
  if (position <= snapshot.blocks[0].pmFrom) return 0
  if (position >= snapshot.blocks[snapshot.blocks.length - 1].pmTo) return snapshot.text.length

  let previous: TextBlockPosition | null = null
  let next: TextBlockPosition | null = null

  for (const block of snapshot.blocks) {
    if (block.pmTo <= position) previous = block
    if (block.pmFrom >= position) {
      next = block
      break
    }
  }

  if (affinity === 'backward' && previous) return previous.textTo
  if (next) return next.textFrom
  return previous?.textTo ?? 0
}

function normalizedRange(range: { from: number; to: number }, maximum: number): { from: number; to: number } {
  const first = clamp(range.from, 0, maximum)
  const second = clamp(range.to, 0, maximum)
  return first <= second ? { from: first, to: second } : { from: second, to: first }
}

export function textRangeToPositionRange(
  snapshot: TextPositionSnapshot,
  requestedRange: { from: number; to: number },
): PositionRange {
  const range = normalizedRange(requestedRange, snapshot.text.length)
  const from = textOffsetToPosition(snapshot, range.from, 'forward')
  const to = textOffsetToPosition(snapshot, range.to, 'backward')

  if (from <= to) return { from, to, collapsed: from === to }

  const collapse = textOffsetToPosition(snapshot, range.from, 'backward')
  return { from: collapse, to: collapse, collapsed: true }
}

export function positionRangeToTextRange(
  snapshot: TextPositionSnapshot,
  requestedRange: { from: number; to: number },
): PositionRange {
  const range = normalizedRange(requestedRange, snapshot.docSize)
  const from = positionToTextOffset(snapshot, range.from, 'forward')
  const to = positionToTextOffset(snapshot, range.to, 'backward')

  if (from <= to) return { from, to, collapsed: from === to }

  const collapse = positionToTextOffset(snapshot, range.from, 'backward')
  return { from: collapse, to: collapse, collapsed: true }
}

export function createEditorPositionContract(
  documentNode: ProseMirrorNode,
  documentId: string,
  content: JSONContent,
): EditorPositionContract {
  const snapshot = createTextPositionSnapshot(documentNode, documentId, content)

  return Object.freeze({
    snapshot,
    textOffsetToPosition: (offset: number, affinity: PositionAffinity = 'forward') =>
      textOffsetToPosition(snapshot, offset, affinity),
    positionToTextOffset: (position: number, affinity: PositionAffinity = 'forward') =>
      positionToTextOffset(snapshot, position, affinity),
    textRangeToPositionRange: (range: { from: number; to: number }) =>
      textRangeToPositionRange(snapshot, range),
    positionRangeToTextRange: (range: { from: number; to: number }) =>
      positionRangeToTextRange(snapshot, range),
  })
}
