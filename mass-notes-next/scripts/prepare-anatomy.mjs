import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(projectRoot, 'assets-source', 'anatomy')
const partNames = (await readdir(sourceDirectory)).filter((name) => /^anatomia-refinada\.part-\d+\.b64$/.test(name)).sort()
const parts = await Promise.all(partNames.map(async (name) => ({
  name,
  encoded: (await readFile(resolve(sourceDirectory, name), 'utf8')).replace(/\s/g, ''),
})))

console.log('[Mass Notes] partes encontradas:', parts.map(({ name, encoded }) => `${name}:${encoded.length}`).join(', '))

const candidates = []
for (let mask = 1; mask < (1 << parts.length); mask += 1) {
  if ((mask & 1) === 0) continue
  const selected = parts.filter((_, index) => mask & (1 << index))
  const encoded = selected.map((part) => part.encoded).join('')
  try {
    const compressed = Buffer.from(encoded, 'base64')
    const html = gunzipSync(compressed)
    const source = html.toString('utf8')
    if (!source.startsWith('<!DOCTYPE html>') || !source.includes('StPageFlip 2.0.7') || !source.includes('Anatomia do Livro — Escrevaral')) continue
    candidates.push({
      parts: selected.map((part) => part.name),
      encodedLength: encoded.length,
      gzipLength: compressed.length,
      gzipSha256: createHash('sha256').update(compressed).digest('hex'),
      htmlLength: html.length,
      htmlSha256: createHash('sha256').update(html).digest('hex'),
    })
  } catch {
    // combinação inválida; continua a busca ordenada
  }
}

if (!candidates.length) throw new Error('Nenhuma combinação ordenada produziu a Anatomia StPageFlip íntegra.')
console.log('[Mass Notes] candidatas válidas:', JSON.stringify(candidates, null, 2))
throw new Error('Diagnóstico concluído; fixe a candidata aprovada antes de publicar.')
