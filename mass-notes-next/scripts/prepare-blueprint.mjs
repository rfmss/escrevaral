import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro.webp')
const target = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro-render.webp')

const stored = await readFile(sourcePath)
const isWebp = (buffer) => buffer.length > 12
  && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
  && buffer.subarray(8, 12).toString('ascii') === 'WEBP'

let decoded = stored
if (!isWebp(decoded)) {
  const encoded = stored.toString('utf8').replace(/\s/g, '')
  decoded = Buffer.from(encoded, 'base64')
}

if (!isWebp(decoded) || decoded.length < 1_000) {
  throw new Error(`O asset técnico versionado não decodificou para WebP válido (${decoded.length} bytes).`)
}

await mkdir(dirname(target), { recursive: true })
await writeFile(target, decoded)
const sha256 = createHash('sha256').update(decoded).digest('hex')
console.log(`[Mass Notes] prancha Blueprint preparada do asset versionado: ${decoded.length} bytes, SHA-256 ${sha256}.`)
