import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, openPage, ROOT } from './helpers.mjs';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

test('serves index with the new title', async () => {
  const { page, browser } = await openPage(server.url);
  try {
    assert.equal(await page.title(), 'Beatrice Baah — Software & AI Engineer');
    assert.equal(await page.locator('[data-terminal]').count(), 1);
  } finally { await browser.close(); }
});
