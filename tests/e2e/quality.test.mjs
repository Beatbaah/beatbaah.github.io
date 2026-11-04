import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { startServer, openPage, ROOT } from './helpers.mjs';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

for (const width of [375, 1440]) {
  test(`no console errors (${width})`, async () => {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 30)); }
      });
      await page.waitForTimeout(500);
      assert.deepEqual(errors, []);
    } finally { await browser.close(); }
  });
}

test('js budget under 25 KB', async () => {
  const dir = path.join(ROOT, 'js');
  let total = 0;
  for (const f of await fs.readdir(dir)) total += (await fs.stat(path.join(dir, f))).size;
  assert.ok(total < 25 * 1024, `${total} bytes`);
});

test('no horizontal scroll after interactions at 375', async () => {
  const { page, browser } = await openPage(server.url, { width: 375, hasTouch: true });
  try {
    for (const cmd of ['projects', 'contact', 'stack', 'certs']) {
      await page.locator('.term-input').fill(cmd);
      await page.locator('.term-input').press('Enter');
    }
    await page.evaluate(() => document.querySelectorAll('.log details').forEach(d => { d.open = true; }));
    await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(300);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= 375);
  } finally { await browser.close(); }
});

test('keyboard reachable with visible focus', async () => {
  const { page, browser } = await openPage(server.url);
  try {
    const wanted = new Set(['term-input', 'nav:#work', 'nav:#contact', 'cv', 'submit']);
    for (let i = 0; i < 80 && wanted.size; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        const ring = cs.outlineStyle !== 'none' || el.closest('.terminal')?.matches(':focus-within');
        let key = null;
        if (el.classList.contains('term-input')) key = 'term-input';
        else if (el.closest('.nav') && el.getAttribute('href')) key = `nav:${el.getAttribute('href')}`;
        else if (el.hasAttribute('download')) key = 'cv';
        else if (el.matches('#contact-form [type=submit]')) key = 'submit';
        return { key, ring };
      });
      if (info.key && wanted.has(info.key)) {
        assert.ok(info.ring, `${info.key} shows focus`);
        wanted.delete(info.key);
      }
    }
    assert.deepEqual([...wanted], []);
  } finally { await browser.close(); }
});
