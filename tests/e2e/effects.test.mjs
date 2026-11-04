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
const scrollThrough = (page) => page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 300) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40)); }
});

test('hero name scrambles then resolves', async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    // record every text the hero name shows, from before the module runs
    await page.addInitScript(() => {
      window.__seen = new Set();
      new MutationObserver(() => {
        const el = document.querySelector('h1 [data-decrypt]');
        if (el) window.__seen.add(el.textContent);
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    await page.goto(server.url);
    await page.waitForTimeout(1200);
    assert.ok(await page.evaluate(() => window.__seen.size) > 1, 'text changed during the effect');
    assert.equal(await page.locator('h1 [data-decrypt]').textContent(), 'Beatrice Baah');
    assert.equal(await page.locator('h1 [data-decrypt]').getAttribute('aria-label'), 'Beatrice Baah');
  } finally { await browser.close(); }
});

test('effects mark the page with html.fx', () => withPage({}, async (page) => {
  assert.match(await page.getAttribute('html', 'class') ?? '', /\bfx\b/);
}));

test('reveals fire on scroll', () => withPage({}, async (page) => {
  await page.locator('#capabilities').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const vis = await page.$$eval('#capabilities [data-reveal]', els => els.map(e => e.classList.contains('is-visible')));
  assert.ok(vis.length > 0 && vis.every(Boolean), String(vis));
}));

test('nothing stays hidden after scrolling through', () => withPage({}, async (page) => {
  await scrollThrough(page);
  await page.waitForTimeout(1600); // let staggered 0.7s transitions finish
  const ops = await page.$$eval('[data-reveal]', els => els.map(e => getComputedStyle(e).opacity));
  assert.ok(ops.every(o => o === '1'), ops.join(','));
}));

test('progress bar tracks scroll', () => withPage({}, async (page) => {
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(200);
  const ratio = await page.evaluate(() => document.getElementById('progress').getBoundingClientRect().width / innerWidth);
  assert.ok(ratio >= 0.99, String(ratio));
}));

test('spotlight sets cursor position on cards', () => withPage({}, async (page) => {
  const card = page.locator('#project-mysoc');
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 30, box.y + 40);
  assert.equal(await card.evaluate(e => e.style.getPropertyValue('--x')), '30px');
}));

test('carousel next advances', () => withPage({}, async (page) => {
  await page.locator('#testimonials').scrollIntoViewIfNeeded();
  const idx = () => page.$$eval('.slide', s => s.findIndex(x => x.classList.contains('is-active')));
  assert.equal(await idx(), 0);
  await page.click('button[data-dir="next"]');
  assert.equal(await idx(), 1);
  await page.click('button[data-dir="prev"]');
  await page.click('button[data-dir="prev"]');
  assert.equal(await idx(), 2, 'wraps around');
}));

test('carousel stacks all slides on phones', () => withPage({ width: 375 }, async (page) => {
  await scrollThrough(page);
  await page.waitForTimeout(900);
  const vis = await page.$$eval('.slide', s => s.map(x => getComputedStyle(x).visibility));
  assert.deepEqual(vis, ['visible', 'visible', 'visible']);
}));

test('reduced motion: no scramble, nothing hidden, no auto-advance', () => withPage({ reducedMotion: 'reduce' }, async (page) => {
  assert.equal(await page.locator('h1 [data-decrypt]').textContent(), 'Beatrice Baah');
  assert.doesNotMatch(await page.getAttribute('html', 'class') ?? '', /\bfx\b/);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const ops = await page.$$eval('[data-reveal]', els => els.map(e => getComputedStyle(e).opacity));
  assert.ok(ops.every(o => o === '1'));
  await page.waitForTimeout(7000);
  assert.equal(await page.$$eval('.slide', s => s.findIndex(x => x.classList.contains('is-active'))), 0);
}));

test('carousel count is not a live region', () => withPage({}, async (page) => {
  assert.equal(await page.locator('.carousel-count').getAttribute('aria-live'), null);
}));

test('carousel has a pause button that stops autoplay', async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.clock.install();
    await page.goto(server.url);
    const idx = () => page.$$eval('.slide', s => s.findIndex(x => x.classList.contains('is-active')));
    await page.clock.runFor(6500);
    assert.equal(await idx(), 1, 'autoplay advances');
    const btn = page.locator('button[data-action="toggle"]');
    await btn.click();
    assert.equal(await btn.getAttribute('aria-pressed'), 'true');
    await page.mouse.move(5, 5); // leave the carousel
    await page.clock.runFor(20000);
    assert.equal(await idx(), 1, 'stays paused');
  } finally { await browser.close(); }
});

test('carousel stays paused while keyboard focus is inside', async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.clock.install();
    await page.goto(server.url);
    await page.focus('button[data-dir="next"]');
    await page.keyboard.press('Enter');
    await page.locator('#testimonials').hover();
    await page.mouse.move(5, 5);
    const idx = () => page.$$eval('.slide', s => s.findIndex(x => x.classList.contains('is-active')));
    const before = await idx();
    await page.clock.runFor(13000);
    assert.equal(await idx(), before);
  } finally { await browser.close(); }
});
