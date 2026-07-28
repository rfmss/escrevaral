import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXPECTED_LENGTH = 43_462
const EXPECTED_SHA256 = '9c1fd7429b09df2087f2ac38f0ddf097ed32719ac5dde02877303eaa0c25a028'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anatomySource = resolve(projectRoot, 'public', 'anatomia-do-livro.html')
const target = resolve(projectRoot, 'public', 'assets', 'blueprint', 'anatomia-livro-render.webp')

const html = await readFile(anatomySource, 'utf8')
const embeddedWebps = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)]
  .map((match) => Buffer.from(match[1], 'base64'))

const decoded = embeddedWebps.find((candidate) => {
  const sha256 = createHash('sha256').update(candidate).digest('hex')
  return candidate.length === EXPECTED_LENGTH && sha256 === EXPECTED_SHA256
})

if (!decoded) {
  const inventory = embeddedWebps.map((candidate) => ({
    length: candidate.length,
    sha256: createHash('sha256').update(candidate).digest('hex'),
  }))
  throw new Error(`A prancha Blueprint canônica não foi encontrada: ${JSON.stringify(inventory)}`)
}
if (decoded.subarray(0, 4).toString('ascii') !== 'RIFF' || decoded.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('A prancha incorporada não decodificou para WebP RIFF.')
}

await mkdir(dirname(target), { recursive: true })
await writeFile(target, decoded)
console.log(`[Mass Notes] prancha Blueprint preparada: ${decoded.length} bytes, SHA-256 ${EXPECTED_SHA256}.`)
