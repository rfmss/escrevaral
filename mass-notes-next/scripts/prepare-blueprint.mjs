import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro.webp')
const target = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro-render.webp')

const encoded = (await readFile(source, 'utf8')).trim()
const decoded = Buffer.from(encoded, 'base64')

if (decoded.subarray(0, 4).toString('ascii') !== 'RIFF' || decoded.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('A fonte da prancha não decodificou para um WebP RIFF válido.')
}

await mkdir(dirname(target), { recursive: true })
await writeFile(target, decoded)
console.log(`[Mass Notes] prancha Blueprint preparada em ${decoded.length} bytes.`)
