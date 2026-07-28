import { copyFile, mkdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(projectRoot, '..', 'anatomia-do-livro.html')
const target = resolve(projectRoot, 'public', 'anatomia-do-livro.html')

await stat(source)
await mkdir(dirname(target), { recursive: true })
await copyFile(source, target)
console.log('[Mass Notes] anatomia-do-livro.html copiado sem transformação para public/.')
