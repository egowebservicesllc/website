import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// PORT/BASE_PATH are set by Replit's artifact runtime. When building elsewhere
// (e.g. a Vercel build, which sets neither), fall back to sane defaults so a
// plain `pnpm build` / `pnpm dev` still works.
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5173;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || '/';
const isReplitDev =
  process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // The Replit-only dev plugins below are optional: they enhance the
    // in-browser dev experience on Replit and are skipped everywhere else
    // (e.g. `vercel build`), so they never affect the production bundle.
    ...(isReplitDev
      ? [
          await import('@replit/vite-plugin-runtime-error-modal').then((m) =>
            m.default(),
          ),
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
