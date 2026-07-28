import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PNG_SIGNATURE = '89504e470d0a1a0a'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anatomySource = resolve(projectRoot, '..', 'anatomia-do-livro.html')
const target = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro-render.png')

const html = await readFile(anatomySource, 'utf8')
const embeddedPngs = [...html.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)]
  .map((match) => match[1])
  .sort((left, right) => right.length - left.length)

if (!embeddedPngs.length) {
  throw new Error('O HTML da Anatomia não contém uma prancha PNG embutida.')
}

const decoded = Buffer.from(embeddedPngs[0], 'base64')
const signature = decoded.subarray(0, 8).toString('hex')

if (signature !== PNG_SIGNATURE) {
  throw new Error('A maior imagem embutida da Anatomia não decodificou para PNG.')
}

const width = decoded.readUInt32BE(16)
const height = decoded.readUInt32BE(20)
if (width < 1_000 || height < 500) {
  throw new Error(`Prancha embutida pequena demais para o canvas: ${width}×${height}.`)
}

const sha256 = createHash('sha256').update(decoded).digest('hex')
await mkdir(dirname(target), { recursive: true })
await writeFile(target, decoded)
console.log(`[Mass Notes] prancha Blueprint extraída da Anatomia: ${width}×${height}, ${decoded.length} bytes, SHA-256 ${sha256}.`)
