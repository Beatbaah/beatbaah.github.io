import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

/** Static file server on a random port. Mirrors GitHub Pages: dir → index.html, missing → 404.html. */
export async function startServer(root) {
  const server = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, p);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      const nf = await fs.readFile(path.join(root, '404.html')).catch(() => 'not found');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(nf);
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return {
    url: `http://127.0.0.1:${server.address().port}/`,
    close: () => new Promise(r => server.close(r)),
  };
}

/** Launch chromium and open url. opts: width, javaScriptEnabled, reducedMotion, hasTouch. */
export async function openPage(url, opts = {}) {
  const browser = await chromium.launch();
  const width = opts.width ?? 1440;
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 800 : 900 },
    javaScriptEnabled: opts.javaScriptEnabled ?? true,
    reducedMotion: opts.reducedMotion ?? 'no-preference',
    hasTouch: opts.hasTouch ?? false,
    isMobile: opts.hasTouch ?? false,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  return { page, browser };
}
