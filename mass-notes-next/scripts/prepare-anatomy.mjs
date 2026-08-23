import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(projectRoot, 'public', 'anatomia-do-livro.html')
const html = await readFile(target)
const source = html.toString('utf8')

const requiredMarkers = [
  '<!DOCTYPE html>',
  'Anatomia do Livro — Escrevaral',
  'page-flip@2.0.7',
  '--sky:#a9d4e4',
  'class="stage-panel"',
  'id="pageFlipBook"',
  'assets/anatomia/anatomia-asset-1.webp',
  'assets/anatomia/anatomia-asset-2.webp',
  "document.documentElement.classList.add('is-embedded')",
]

if (html.length < 50_000 || html.length > 500_000) {
  throw new Error(`A Anatomia direta tem tamanho inesperado: ${html.length} bytes.`)
}
for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`A Anatomia direta não contém o marcador obrigatório: ${marker}`)
}

const forbiddenMarkers = [
  '--paper:#f1e7d4',
  'data:image/png;base64',
  'atob(',
  'anatomia-original.html',
]
for (const marker of forbiddenMarkers) {
  if (source.includes(marker)) throw new Error(`A Anatomia direta contém dependência proibida: ${marker}`)
}

const sha256 = createHash('sha256').update(html).digest('hex')
console.log(`[Mass Notes] Anatomia original otimizada validada: ${html.length} bytes, SHA-256 ${sha256}.`)
