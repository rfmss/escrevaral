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
]

if (html.length < 5_000) throw new Error(`A Anatomia direta está incompleta: ${html.length} bytes.`)
for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`A Anatomia direta não contém o marcador obrigatório: ${marker}`)
}
if (source.includes('--paper:#f1e7d4') || source.includes('A Cartografia do Esquecimento')) {
  throw new Error('A versão marrom antiga foi detectada no HTML da Anatomia.')
}

const sha256 = createHash('sha256').update(html).digest('hex')
console.log(`[Mass Notes] Anatomia azul validada diretamente: ${html.length} bytes, SHA-256 ${sha256}.`)
