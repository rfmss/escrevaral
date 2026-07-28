import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(projectRoot, 'assets-source', 'anatomy')
const readPart = async (number) => (await readFile(resolve(sourceDirectory, `anatomia-refinada.part-${number}.b64`), 'utf8')).replace(/\s/g, '')
const base = (await Promise.all(['00', '01', '02', '03', '04', '05'].map(readPart))).join('')
const part07 = await readPart('07')
const part08 = await readPart('08')
const remaining = 173_912 - base.length

const candidates = [
  ['08-prefix', base + part08.slice(0, remaining)],
  ['07-then-08', base + part07 + part08.slice(0, remaining - part07.length)],
  ['08-then-07', base + part08.slice(0, remaining - part07.length) + part07],
  ['08a-07-08c', base + part08.slice(0, 20_000) + part07 + part08.slice(40_000, 40_000 + remaining - 40_000)],
  ['08a-07-08b', base + part08.slice(0, 20_000) + part07 + part08.slice(20_000, 20_000 + remaining - 40_000)],
  ['08b-07-08c', base + part08.slice(20_000, 40_000) + part07 + part08.slice(40_000, 40_000 + remaining - 40_000)],
  ['07-08-tail', base + part07 + part08.slice(part08.length - (remaining - part07.length))],
]

const results = []
for (const [name, encoded] of candidates) {
  try {
    const compressed = Buffer.from(encoded, 'base64')
    const gzipSha256 = createHash('sha256').update(compressed).digest('hex')
    const html = gunzipSync(compressed)
    const source = html.toString('utf8')
    results.push({
      name,
      encodedLength: encoded.length,
      gzipLength: compressed.length,
      gzipSha256,
      htmlLength: html.length,
      htmlSha256: createHash('sha256').update(html).digest('hex'),
      valid: source.startsWith('<!DOCTYPE html>') && source.includes('StPageFlip 2.0.7') && source.includes('Anatomia do Livro — Escrevaral'),
    })
  } catch (error) {
    results.push({ name, encodedLength: encoded.length, error: error instanceof Error ? error.message : String(error) })
  }
}
console.log('[Mass Notes] diagnóstico de composição:', JSON.stringify(results, null, 2))
const valid = results.filter((result) => result.valid)
if (!valid.length) throw new Error('Nenhuma composição plausível produziu a Anatomia StPageFlip íntegra.')
throw new Error(`Diagnóstico concluído com ${valid.length} candidata(s); fixe a composição antes de publicar.`)
