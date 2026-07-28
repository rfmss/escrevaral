import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXPECTED_PARTS = 8
const EXPECTED_ENCODED_LENGTH = 173_912
const EXPECTED_GZIP_LENGTH = 130_433
const EXPECTED_GZIP_SHA256 = '3ef59ed30455181b0682db4d8234c3829583551bb007335300be5325c5bf9a07'
const EXPECTED_HTML_LENGTH = 208_728
const EXPECTED_HTML_SHA256 = 'd618b69aeab6551c5b0815024c8a9b7ec545ffe970776084be5e86b06a344fd8'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(projectRoot, 'assets-source', 'anatomy')
const target = resolve(projectRoot, 'public', 'anatomia-do-livro.html')
const partNames = (await readdir(sourceDirectory)).filter((name) => /^anatomia-refinada\.part-\d+\.b64$/.test(name)).sort()
if (partNames.length !== EXPECTED_PARTS) throw new Error(`A Anatomia refinada exige ${EXPECTED_PARTS} partes; foram encontradas ${partNames.length}.`)
const stored = (await Promise.all(partNames.map((name) => readFile(resolve(sourceDirectory, name), 'utf8')))).join('').replace(/\s/g, '')
if (stored.length < EXPECTED_ENCODED_LENGTH) throw new Error(`Pacote da Anatomia incompleto: ${stored.length}/${EXPECTED_ENCODED_LENGTH} caracteres.`)
const encoded = stored.slice(0, EXPECTED_ENCODED_LENGTH)
const compressed = Buffer.from(encoded, 'base64')
const compressedSha256 = createHash('sha256').update(compressed).digest('hex')
if (compressed.length !== EXPECTED_GZIP_LENGTH || compressedSha256 !== EXPECTED_GZIP_SHA256) throw new Error(`Pacote gzip inesperado: ${compressed.length} bytes, SHA-256 ${compressedSha256}.`)
const html = gunzipSync(compressed)
const htmlSha256 = createHash('sha256').update(html).digest('hex')
if (html.length !== EXPECTED_HTML_LENGTH || htmlSha256 !== EXPECTED_HTML_SHA256) throw new Error(`HTML refinado inesperado: ${html.length} bytes, SHA-256 ${htmlSha256}.`)
const source = html.toString('utf8')
if (!source.startsWith('<!DOCTYPE html>') || !source.includes('StPageFlip 2.0.7') || !source.includes('Anatomia do Livro — Escrevaral')) throw new Error('O pacote não contém a Anatomia StPageFlip aprovada.')
await mkdir(dirname(target), { recursive: true })
await writeFile(target, html)
console.log(`[Mass Notes] Anatomia StPageFlip preparada: ${html.length} bytes, SHA-256 ${htmlSha256}.`)
