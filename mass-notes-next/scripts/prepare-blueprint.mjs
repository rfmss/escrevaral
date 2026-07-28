import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXPECTED_LENGTH = 43_462
const EXPECTED_SHA256 = '64756b9a62bedb60660c1d0794e31bf6bd727aafb29be175549159d7eaa6d362'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anatomySource = resolve(projectRoot, 'public', 'anatomia-do-livro.html')
const target = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro-render.webp')

const html = await readFile(anatomySource, 'utf8')
const embeddedWebps = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)]
  .map((match) => match[1])
  .sort((left, right) => right.length - left.length)

if (!embeddedWebps.length) {
  throw new Error('A Anatomia StPageFlip não contém a prancha WebP incorporada.')
}

const decoded = Buffer.from(embeddedWebps[0], 'base64')
const sha256 = createHash('sha256').update(decoded).digest('hex')
if (decoded.subarray(0, 4).toString('ascii') !== 'RIFF' || decoded.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('A maior imagem incorporada não decodificou para WebP RIFF.')
}
if (decoded.length !== EXPECTED_LENGTH || sha256 !== EXPECTED_SHA256) {
  throw new Error(`Prancha WebP inesperada: ${decoded.length} bytes, SHA-256 ${sha256}.`)
}

await mkdir(dirname(target), { recursive: true })
await writeFile(target, decoded)
console.log(`[Mass Notes] prancha Blueprint preparada: ${decoded.length} bytes, SHA-256 ${sha256}.`)
