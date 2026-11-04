import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, openPage, ROOT } from './helpers.mjs';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

async function withPage(opts, fn) {
  const { page, browser } = await openPage(server.url, opts);
  try { await fn(page); } finally { await browser.close(); }
}

// ── Testimonials: three quote cards, no slider ───────
test('testimonials are three quote cards with initials avatars, no slider', () => withPage({}, async (page) => {
  assert.equal(await page.locator('#testimonials .carousel').count(), 0);
  const quotes = page.locator('#testimonials .quotes .quote');
  assert.equal(await quotes.count(), 3);
  const initials = await page.$$eval('#testimonials .q-avatar', els => els.map(e => e.textContent.trim()));
  assert.deepEqual(initials, ['KA', 'EA', 'MO']);
  assert.equal(await page.locator('#testimonials .q-avatar').first().getAttribute('aria-hidden'), 'true');
}));

test('quote cards sit side by side on desktop and stack on phones', async () => {
  for (const [width, sideBySide] of [[1440, true], [375, false]]) {
    await withPage({ width }, async (page) => {
      const tops = await page.$$eval('#testimonials .quote', els => els.map(e => Math.round(e.getBoundingClientRect().top)));
      const same = tops.every(t => t === tops[0]);
      assert.equal(same, sideBySide, `${width}: ${tops}`);
    });
  }
});

// ── Contact: one panel ───────────────────────────────
test('contact is one panel holding heading, globe, actions, hiring and form', () => withPage({}, async (page) => {
  const panel = page.locator('#contact .contact-panel');
  assert.equal(await panel.count(), 1);
  for (const sel of ['h2', '.globe-slot', '.cp-actions', '.contact-col', '#contact-form']) {
    assert.ok(await panel.locator(sel).count() >= 1, sel);
  }
}));

test('quick actions: email, WhatsApp and CV', () => withPage({}, async (page) => {
  const a = page.locator('#contact .cp-actions');
  assert.equal(await a.locator('a[href="mailto:beatrice.baah3@hotmail.com"]').count(), 1);
  assert.equal(await a.locator('a[href^="https://wa.me/"]').count(), 1);
  assert.equal(await a.locator('a[download][href="assets/Beatrice_Baah_CV.pdf"]').count(), 1);
}));

test('copy-email button copies the address and confirms', async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: server.url.replace(/\/$/, '') });
  const page = await ctx.newPage();
  try {
    await page.goto(server.url);
    const btn = page.locator('#contact [data-copy]');
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'beatrice.baah3@hotmail.com');
    assert.match(await btn.innerText(), /copied/i);
  } finally { await browser.close(); }
});

test('copy button is hidden without JS', () => withPage({ javaScriptEnabled: false }, async (page) => {
  assert.equal(await page.locator('#contact [data-copy]').isVisible(), false);
}));

test('no dead gap between testimonials and the contact panel', () => withPage({}, async (page) => {
  const gap = await page.evaluate(() => document.querySelector('.contact-panel').getBoundingClientRect().top
    - document.querySelector('#testimonials .quotes').getBoundingClientRect().bottom);
  assert.ok(gap < 200, `gap ${gap}px`);
}));
