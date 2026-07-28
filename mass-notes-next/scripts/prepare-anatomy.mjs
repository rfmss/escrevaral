import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXPECTED_PARTS = 9
const EXPECTED_PART_LENGTHS = [20_000, 20_000, 20_000, 19_999, 20_001, 20_000, 20_000, 20_000, 13_912]
const EXPECTED_ENCODED_LENGTH = 173_912
const EXPECTED_GZIP_LENGTH = 130_433
const EXPECTED_GZIP_SHA256 = '3ef59ed30455181b0682db4d8234c3829583551bb007335300be5325c5bf9a07'
const EXPECTED_HTML_LENGTH = 208_728
const EXPECTED_HTML_SHA256 = 'd618b69aeab6551c5b0815024c8a9b7ec545ffe970776084be5e86b06a344fd8'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(projectRoot, 'assets-source', 'anatomy')
const target = resolve(projectRoot, 'public', 'anatomia-do-livro.html')

const partNames = Array.from({ length: EXPECTED_PARTS }, (_, index) => `anatomia-refinada.part-${String(index).padStart(2, '0')}.b64`)
const parts = await Promise.all(partNames.map(async (name, index) => {
  const value = (await readFile(resolve(sourceDirectory, name), 'utf8')).replace(/\s/g, '')
  if (value.length !== EXPECTED_PART_LENGTHS[index]) {
    throw new Error(`${name} possui ${value.length} caracteres; esperado ${EXPECTED_PART_LENGTHS[index]}.`)
  }
  return value
}))

const encoded = parts.join('')
if (encoded.length !== EXPECTED_ENCODED_LENGTH) {
  throw new Error(`Pacote Base64 incompleto: ${encoded.length}/${EXPECTED_ENCODED_LENGTH} caracteres.`)
}

const compressed = Buffer.from(encoded, 'base64')
const compressedSha256 = createHash('sha256').update(compressed).digest('hex')
if (compressed.length !== EXPECTED_GZIP_LENGTH || compressedSha256 !== EXPECTED_GZIP_SHA256) {
  throw new Error(`Pacote gzip inesperado: ${compressed.length} bytes, SHA-256 ${compressedSha256}.`)
}

const html = gunzipSync(compressed)
const htmlSha256 = createHash('sha256').update(html).digest('hex')
if (html.length !== EXPECTED_HTML_LENGTH || htmlSha256 !== EXPECTED_HTML_SHA256) {
  throw new Error(`HTML inesperado: ${html.length} bytes, SHA-256 ${htmlSha256}.`)
}

const source = html.toString('utf8')
const requiredMarkers = [
  '<!DOCTYPE html>',
  'Anatomia do Livro — Escrevaral',
  'StPageFlip 2.0.7',
  '--sky:#a9d4e4',
  'class="stage-panel"',
  'id="pageFlipBook"',
]
for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`A Anatomia canônica não contém o marcador obrigatório: ${marker}`)
}
if (source.includes('--paper:#f1e7d4')) {
  throw new Error('A página bege antiga foi detectada no pacote da Anatomia.')
}

await mkdir(dirname(target), { recursive: true })
await writeFile(target, html)
console.log(`[Mass Notes] Anatomia azul preparada: ${html.length} bytes, SHA-256 ${htmlSha256}.`)
