import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { posApi } from './server/vite-plugin.ts'

/**
 * server/*.ts bundled into the browser (src/mock/engine.ts, the POS for static hosting) gets small stand-ins for
 * the Node modules it uses. Client build only: the dev/preview servers and `npm run server` run the real ones.
 */
function browserNodeShims(): Plugin {
  const shim = (name: string) => fileURLToPath(new URL(`./src/mock/node-${name}.ts`, import.meta.url))
  const shims: Record<string, string> = { 'node:fs': shim('fs'), 'node:path': shim('path'), 'node:crypto': shim('crypto') }
  return {
    name: 'browser-node-shims',
    enforce: 'pre',
    resolveId(id, importer, opts) {
      if (opts?.ssr || !importer || !/[\\/]server[\\/]/.test(importer)) return null
      return shims[id] ?? null
    },
  }
}

// Real URLs ("/breeds/korat", "/en/compare") need absolute asset paths, so base is the site root.
// Two pages: the brochure (index.html, every route prerendered after the build by scripts/prerender.mjs)
// and the shop's back office (admin/index.html → /admin), whose simulated POS API is mounted into the dev
// and preview servers by posApi(). On static hosting the same API runs in the browser instead
// (src/lib/apiFallback.ts).
export default defineConfig({
  base: '/',
  plugins: [react(), posApi(), browserNodeShims()],
  server: { port: 5173, strictPort: true, watch: { ignored: ['**/.pos-data/**', '**/dist-ssr/**'] } },
  build: {
    rollupOptions: {
      input: { main: 'index.html', admin: 'admin/index.html' },
    },
  },
})
