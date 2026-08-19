import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const SERVICE_WORKER_BUILD_TOKEN = '__ESCREVARAL_BUILD_ID__'

function serviceWorkerBuildStamp(): Plugin {
  const buildId = process.env.GITHUB_SHA?.slice(0, 12) || `local-${Date.now()}`

  return {
    name: 'escrevaral-service-worker-build-stamp',
    apply: 'build',
    closeBundle() {
      const target = resolve(__dirname, 'dist/service-worker.js')
      const source = readFileSync(target, 'utf8')
      if (!source.includes(SERVICE_WORKER_BUILD_TOKEN)) {
        throw new Error('Token de versão do service worker não encontrado no build.')
      }
      writeFileSync(target, source.replaceAll(SERVICE_WORKER_BUILD_TOKEN, buildId), 'utf8')
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
