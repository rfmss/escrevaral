import type { JSONContent } from '@tiptap/core'
import { displayTitle, type EscrevaralDocument } from '../domain/document'

export type ExportFormat = 'txt' | 'md' | 'html'

export type DocumentExport = {
  format: ExportFormat
  filename: string
  mimeType: string
  content: string
}

const FORMAT_META: Record<ExportFormat, { extension: string; mimeType: string }> = {
  txt: { extension: 'txt', mimeType: 'text/plain;charset=utf-8' },
  md: { extension: 'md', mimeType: 'text/markdown;charset=utf-8' },
  html: { extension: 'html', mimeType: 'text/html;charset=utf-8' },
}

function childNodes(node: JSONContent): JSONContent[] {
  return node.content ?? []
}

function normalizeOutput(value: string): string {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function slugifyFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[ºª]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '') || 'documento'
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeMarkdown(value: string): string {
  return value.replace(/([\\`*_{}\[\]<>~])/g, '\\$1')
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ')}"`
}

function safeHref(value: unknown): string | null {
  const href = typeof value === 'string' ? value.trim() : ''
  if (!href) return null
  try {
    const parsed = new URL(href, 'https://escrevaral.local')
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return null
    return href
  } catch {
    return null
  }
}

function textWithMarks(node: JSONContent, format: ExportFormat): string {
  const raw = node.text ?? ''
  const boundary = format === 'md' ? raw.match(/^(\s*)([\s\S]*?)(\s*)$/) : null
  const leading = boundary?.[1] ?? ''
  const core = boundary?.[2] ?? raw
  const trailing = boundary?.[3] ?? ''
  let rendered = format === 'html' ? escapeHtml(core) : format === 'md' ? escapeMarkdown(core) : core
  const marks = node.marks ?? []

  for (const markType of ['bold', 'italic', 'underline', 'strike', 'link'] as const) {
    const mark = marks.find((candidate) => candidate.type === markType)
    if (!mark) continue

    if (format === 'txt') {
      if (markType === 'link') {
        const href = safeHref(mark.attrs?.href)
        if (href && href !== raw) rendered = `${rendered} <${href}>`
      }
      continue
    }

    if (format === 'md') {
      if (markType === 'bold') rendered = `**${rendered}**`
      if (markType === 'italic') rendered = `_${rendered}_`
      if (markType === 'underline') rendered = `<u>${rendered}</u>`
      if (markType === 'strike') rendered = `~~${rendered}~~`
      if (markType === 'link') {
        const href = safeHref(mark.attrs?.href)
        if (href) rendered = `[${rendered}](${href.replaceAll(')', '\\)')})`
      }
      continue
    }

    if (markType === 'bold') rendered = `<strong>${rendered}</strong>`
    if (markType === 'italic') rendered = `<em>${rendered}</em>`
    if (markType === 'underline') rendered = `<u>${rendered}</u>`
    if (markType === 'strike') rendered = `<s>${rendered}</s>`
    if (markType === 'link') {
      const href = safeHref(mark.attrs?.href)
      if (href) rendered = `<a href="${escapeHtml(href)}">${rendered}</a>`
    }
  }

  return `${leading}${rendered}${trailing}`
}

function renderInline(node: JSONContent, format: ExportFormat): string {
  if (node.type === 'text') return textWithMarks(node, format)
  if (node.type === 'hardBreak') return format === 'html' ? '<br>' : '\n'
  return childNodes(node).map((child) => renderInline(child, format)).join('')
}

function indentLines(value: string, prefix: string): string {
  return value.split('\n').map((line) => `${prefix}${line}`).join('\n')
}

function renderMarkdownList(node: JSONContent, depth: number): string {
  const ordered = node.type === 'orderedList'
  const start = Number(node.attrs?.start) || 1
  return childNodes(node).map((item, index) => {
    const marker = ordered ? `${start + index}.` : '-'
    const indent = '  '.repeat(depth)
    const itemChildren = childNodes(item)
    const first = itemChildren[0]
    const firstLine = first?.type === 'paragraph'
      ? renderInline(first, 'md')
      : first
        ? renderMarkdownBlock(first, depth + 1)
        : ''
    const lines = [`${indent}${marker} ${firstLine}`.trimEnd()]

    for (const extra of itemChildren.slice(1)) {
      if (extra.type === 'bulletList' || extra.type === 'orderedList') {
        lines.push(renderMarkdownList(extra, depth + 1))
      } else {
        lines.push(indentLines(renderMarkdownBlock(extra, depth + 1), '  '.repeat(depth + 1)))
      }
    }
    return lines.join('\n')
  }).join('\n')
}

function renderMarkdownBlock(node: JSONContent, depth = 0): string {
  if (node.type === 'doc') return childNodes(node).map((child) => renderMarkdownBlock(child, depth)).filter(Boolean).join('\n\n')
  if (node.type === 'paragraph') return renderInline(node, 'md')
  if (node.type === 'heading') {
    const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 1))
    return `${'#'.repeat(level)} ${renderInline(node, 'md')}`
  }
  if (node.type === 'blockquote') {
    return childNodes(node)
      .map((child) => renderMarkdownBlock(child, depth))
      .filter(Boolean)
      .join('\n\n')
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n')
  }
  if (node.type === 'bulletList' || node.type === 'orderedList') return renderMarkdownList(node, depth)
  if (node.type === 'horizontalRule') return '---'
  return childNodes(node).map((child) => renderMarkdownBlock(child, depth)).filter(Boolean).join('\n\n') || renderInline(node, 'md')
}

function renderTextList(node: JSONContent, depth: number): string {
  const ordered = node.type === 'orderedList'
  const start = Number(node.attrs?.start) || 1
  return childNodes(node).map((item, index) => {
    const marker = ordered ? `${start + index}.` : '-'
    const indent = '  '.repeat(depth)
    const itemChildren = childNodes(item)
    const first = itemChildren[0]
    const firstLine = first?.type === 'paragraph'
      ? renderInline(first, 'txt')
      : first
        ? renderTextBlock(first, depth + 1)
        : ''
    const lines = [`${indent}${marker} ${firstLine}`.trimEnd()]

    for (const extra of itemChildren.slice(1)) {
      if (extra.type === 'bulletList' || extra.type === 'orderedList') {
        lines.push(renderTextList(extra, depth + 1))
      } else {
        lines.push(indentLines(renderTextBlock(extra, depth + 1), '  '.repeat(depth + 1)))
      }
    }
    return lines.join('\n')
  }).join('\n')
}

function renderTextBlock(node: JSONContent, depth = 0): string {
  if (node.type === 'doc') return childNodes(node).map((child) => renderTextBlock(child, depth)).filter(Boolean).join('\n\n')
  if (node.type === 'paragraph' || node.type === 'heading') return renderInline(node, 'txt')
  if (node.type === 'blockquote') {
    return childNodes(node)
      .map((child) => renderTextBlock(child, depth))
      .filter(Boolean)
      .join('\n\n')
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n')
  }
  if (node.type === 'bulletList' || node.type === 'orderedList') return renderTextList(node, depth)
  if (node.type === 'horizontalRule') return '—'.repeat(24)
  return childNodes(node).map((child) => renderTextBlock(child, depth)).filter(Boolean).join('\n\n') || renderInline(node, 'txt')
}

function renderHtmlBlock(node: JSONContent): string {
  if (node.type === 'doc') return childNodes(node).map(renderHtmlBlock).join('\n')
  if (node.type === 'paragraph') return `<p>${renderInline(node, 'html')}</p>`
  if (node.type === 'heading') {
    const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 1))
    return `<h${level}>${renderInline(node, 'html')}</h${level}>`
  }
  if (node.type === 'blockquote') return `<blockquote>\n${childNodes(node).map(renderHtmlBlock).join('\n')}\n</blockquote>`
  if (node.type === 'bulletList') return `<ul>\n${childNodes(node).map(renderHtmlBlock).join('\n')}\n</ul>`
  if (node.type === 'orderedList') {
    const start = Number(node.attrs?.start) || 1
    const startAttribute = start === 1 ? '' : ` start="${start}"`
    return `<ol${startAttribute}>\n${childNodes(node).map(renderHtmlBlock).join('\n')}\n</ol>`
  }
  if (node.type === 'listItem') return `<li>${childNodes(node).map(renderHtmlBlock).join('\n')}</li>`
  if (node.type === 'horizontalRule') return '<hr>'
  return childNodes(node).map(renderHtmlBlock).join('\n') || renderInline(node, 'html')
}

function metadataLines(document: EscrevaralDocument): string[] {
  const lines = [`Situação: ${document.status}`]
  if (document.tags.length) lines.push(`Tags: ${document.tags.join(', ')}`)
  return lines
}

function createTextContent(document: EscrevaralDocument): string {
  const title = displayTitle(document)
  const body = normalizeOutput(renderTextBlock(document.content))
  return normalizeOutput([
    title,
    '='.repeat(Math.min(72, Math.max(12, title.length))),
    ...metadataLines(document),
    '',
    body,
  ].join('\n')) + '\n'
}

function createMarkdownContent(document: EscrevaralDocument): string {
  const title = displayTitle(document)
  const frontmatter = [
    '---',
    `title: ${yamlString(title)}`,
    `situacao: ${yamlString(document.status)}`,
  ]
  if (document.tags.length) frontmatter.push(`tags: [${document.tags.map(yamlString).join(', ')}]`)
  frontmatter.push('---')

  const body = normalizeOutput(renderMarkdownBlock(document.content))
  return normalizeOutput([
    ...frontmatter,
    '',
    `# ${escapeMarkdown(title)}`,
    '',
    body,
  ].join('\n')) + '\n'
}

function createHtmlContent(document: EscrevaralDocument): string {
  const title = displayTitle(document)
  const metadata = metadataLines(document).join(' · ')
  const body = renderHtmlBlock(document.content)
  return [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(title)}</title>`,
    '  <style>',
    '    body { max-width: 68ch; margin: 3rem auto; padding: 0 1.25rem; font: 1.05rem/1.75 Georgia, "Times New Roman", serif; color: #1b1b1b; }',
    '    header { margin-bottom: 2rem; border-bottom: 1px solid #bbb; }',
    '    .metadata { color: #555; font-size: .9rem; }',
    '    blockquote { margin-left: 0; padding-left: 1rem; border-left: 3px solid #999; }',
    '    a { color: inherit; text-decoration-thickness: .08em; }',
    '    @media print { body { max-width: none; margin: 0; padding: 2cm; } }',
    '  </style>',
    '</head>',
    '<body>',
    '  <header>',
    `    <h1>${escapeHtml(title)}</h1>`,
    `    <p class="metadata">${escapeHtml(metadata)}</p>`,
    '  </header>',
    `  <main>\n${body}\n  </main>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

export function createDocumentExport(document: EscrevaralDocument, format: ExportFormat): DocumentExport {
  const meta = FORMAT_META[format]
  const content = format === 'txt'
    ? createTextContent(document)
    : format === 'md'
      ? createMarkdownContent(document)
      : createHtmlContent(document)

  return {
    format,
    filename: `${slugifyFilename(displayTitle(document))}.${meta.extension}`,
    mimeType: meta.mimeType,
    content,
  }
}

export function downloadDocumentExport(document: EscrevaralDocument, format: ExportFormat): DocumentExport {
  const exported = createDocumentExport(document, format)
  const blob = new Blob([exported.content], { type: exported.mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = exported.filename
  anchor.rel = 'noopener'
  anchor.hidden = true
  window.document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  return exported
}
