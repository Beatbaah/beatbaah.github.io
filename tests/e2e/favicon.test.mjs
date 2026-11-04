import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, openPage, ROOT } from './helpers.mjs';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

test('favicons work in every browser (Safari ignores SVG icons)', async () => {
  const { page, browser } = await openPage(server.url);
  try {
    const links = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"]', ls => ls.map(l => `${l.rel}|${l.getAttribute('href')}`));
    for (const want of ['icon|favicon.svg', 'icon|favicon-32.png', 'apple-touch-icon|apple-touch-icon.png']) assert.ok(links.includes(want), want);
    for (const [path, type] of [['favicon.ico', 'image/x-icon'], ['favicon-32.png', 'image/png'], ['apple-touch-icon.png', 'image/png']]) {
      const res = await page.request.get(server.url + path);
      assert.equal(res.status(), 200, path);
      assert.equal(res.headers()['content-type'], type, path);
    }
  } finally { await browser.close(); }
});
