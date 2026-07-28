import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXPECTED_PARTS = 5
const EXPECTED_ENCODED_LENGTH = 9_960
const EXPECTED_DECODED_LENGTH = 7_468
const EXPECTED_SHA256 = '16b3a73100a51c42402a4b5b756539d28de25eea744efcf18456893e904f381a'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(projectRoot, 'assets-source', 'runtime')
const target = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro-render.webp')

const partNames = (await readdir(sourceDirectory))
  .filter((name) => /^anatomia-livro\.part-\d+\.b64$/.test(name))
  .sort()

if (partNames.length !== EXPECTED_PARTS) {
  throw new Error(`A prancha runtime exige ${EXPECTED_PARTS} partes; foram encontradas ${partNames.length}.`)
}

const partContents = await Promise.all(
  partNames.map((name) => readFile(resolve(sourceDirectory, name), 'utf8')),
)
const encoded = partContents.join('').replace(/\s/g, '')

if (encoded.length !== EXPECTED_ENCODED_LENGTH) {
  throw new Error(`Base64 da prancha incompleto: ${encoded.length}/${EXPECTED_ENCODED_LENGTH} caracteres.`)
}

const decoded = Buffer.from(encoded, 'base64')
const sha256 = createHash('sha256').update(decoded).digest('hex')

if (decoded.subarray(0, 4).toString('ascii') !== 'RIFF' || decoded.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('A fonte da prancha não decodificou para um WebP RIFF válido.')
}
if (decoded.length !== EXPECTED_DECODED_LENGTH) {
  throw new Error(`WebP runtime incompleto: ${decoded.length}/${EXPECTED_DECODED_LENGTH} bytes.`)
}
if (sha256 !== EXPECTED_SHA256) {
  throw new Error(`SHA-256 inesperado para a prancha runtime: ${sha256}.`)
}

await mkdir(dirname(target), { recursive: true })
await writeFile(target, decoded)
console.log(`[Mass Notes] prancha Blueprint preparada: ${decoded.length} bytes, SHA-256 ${sha256}.`)
