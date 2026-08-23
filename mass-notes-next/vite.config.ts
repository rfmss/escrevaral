import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const SERVICE_WORKER_BUILD_TOKEN = '__ESCREVARAL_BUILD_ID__'
const SERVICE_WORKER_PRECACHE_TOKEN = '__ESCREVARAL_PRECACHE_ASSETS__'

function collectPrecacheAssets(root: string, relative = ''): string[] {
  const directory = resolve(root, relative)
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = relative ? `${relative}/${entry.name}` : entry.name
    if (entry.isDirectory()) return collectPrecacheAssets(root, path)
    if (path === 'service-worker.js' || path.endsWith('.map')) return []
    return [`./${path}`]
  })
}

function serviceWorkerBuildStamp(): Plugin {
  const buildId = process.env.GITHUB_SHA?.slice(0, 12) || `local-${Date.now()}`

  return {
    name: 'escrevaral-service-worker-build-stamp',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const target = resolve(dist, 'service-worker.js')
      const source = readFileSync(target, 'utf8')
      if (!source.includes(SERVICE_WORKER_BUILD_TOKEN) || !source.includes(SERVICE_WORKER_PRECACHE_TOKEN)) {
        throw new Error('Tokens de build do service worker não foram encontrados.')
      }

      const precacheAssets = collectPrecacheAssets(dist).sort()
      const stamped = source
        .replaceAll(SERVICE_WORKER_BUILD_TOKEN, buildId)
        .replace(SERVICE_WORKER_PRECACHE_TOKEN, JSON.stringify(precacheAssets))
      writeFileSync(target, stamped, 'utf8')
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serviceWorkerBuildStamp()],
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
