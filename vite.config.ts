import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev only: runs api/*.ts with the same req/res helpers Vercel adds, so `npm run dev`
 * serves the site and the API together. In production Vercel runs these files itself.
 */
function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();

        const file = join(server.config.root, `${url.pathname}.ts`);
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (!existsSync(file)) return send(404, { success: false, error: `No API route ${url.pathname}` });

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const raw = Buffer.concat(chunks).toString('utf8');
          let body: unknown = raw || undefined;
          if (raw && req.headers['content-type']?.includes('application/json')) {
            try {
              body = JSON.parse(raw);
            } catch {
              return send(400, { success: false, error: 'Invalid JSON body' });
            }
          }

          const vercelRes = Object.assign(res, {
            status: (code: number) => ((res.statusCode = code), vercelRes),
            json: (b: unknown) => (send(res.statusCode, b), vercelRes),
            send: (b: string) => (res.end(b), vercelRes),
          });
          const mod = await server.ssrLoadModule(file);
          await mod.default(Object.assign(req, { query: Object.fromEntries(url.searchParams), body }), vercelRes);
        } catch (err) {
          server.config.logger.error(`[api] ${url.pathname}: ${err instanceof Error ? err.stack : err}`);
          if (!res.headersSent) send(500, { success: false, error: 'Dev API error, see the terminal' });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServer()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        // keep animation libraries in their own long-cacheable chunks
        manualChunks: {
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', '@gsap/react'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
