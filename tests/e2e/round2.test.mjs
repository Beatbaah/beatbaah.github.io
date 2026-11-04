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

// ── Buttons ──────────────────────────────────────────
test('ghost buttons roll a hidden duplicate label and keep their accessible name', () => withPage({}, async (page) => {
  const ghosts = await page.locator('.btn-ghost').count();
  assert.ok(ghosts >= 2);
  assert.equal(await page.locator('.btn-ghost .roll [aria-hidden="true"]').count(), ghosts);
  assert.equal(await page.getByRole('link', { name: 'Download CV', exact: true }).count(), 2);
}));

test('primary buttons have the shine layer', () => withPage({}, async (page) => {
  const anim = await page.locator('#hero .btn-primary').evaluate(el => getComputedStyle(el, '::after').backgroundImage);
  assert.match(anim, /linear-gradient/);
}));

test('primary buttons lean toward the cursor (mouse only)', () => withPage({}, async (page) => {
  const btn = page.locator('#hero .btn-primary');
  const b = await btn.boundingBox();
  await page.mouse.move(b.x + b.width + 30, b.y + b.height / 2);
  await page.waitForTimeout(100);
  assert.notEqual(await btn.evaluate(el => el.style.transform), '');
}));

test('no magnetic effect on touch devices', () => withPage({ width: 375, hasTouch: true }, async (page) => {
  const btn = page.locator('#hero .btn-primary');
  const b = await btn.boundingBox();
  await page.mouse.move(b.x + b.width + 20, b.y + b.height / 2);
  await page.waitForTimeout(100);
  assert.equal(await btn.evaluate(el => el.style.transform), '');
}));

// ── Credentials ──────────────────────────────────────
test('credentials verify line by line when scrolled into view', () => withPage({}, async (page) => {
  assert.equal(await page.locator('#credentials .cred-row').count(), 10);
  await page.locator('#credentials').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll('#credentials .cred-row.is-ok').length === 10, null, { timeout: 6000 });
  assert.match(await page.locator('#credentials .cred-summary').innerText(), /10\/10 verified/);
}));

test('credentials re-run replays the check', () => withPage({}, async (page) => {
  await page.locator('#credentials').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll('#credentials .cred-row.is-ok').length === 10, null, { timeout: 6000 });
  await page.click('#credentials [data-action="rerun"]');
  assert.ok(await page.locator('#credentials .cred-row.is-ok').count() < 10, 'resets');
  await page.waitForFunction(() => document.querySelectorAll('#credentials .cred-row.is-ok').length === 10, null, { timeout: 6000 });
}));

test('credentials fully shown without JS', () => withPage({ javaScriptEnabled: false }, async (page) => {
  const ops = await page.$$eval('#credentials .cred-row', els => els.map(e => getComputedStyle(e).opacity));
  assert.equal(ops.length, 10);
  assert.ok(ops.every(o => o === '1'));
  assert.match(await page.locator('#credentials .cred-summary').innerText(), /10\/10 verified/);
}));

test('credentials fully shown immediately with reduced motion', () => withPage({ reducedMotion: 'reduce' }, async (page) => {
  await page.locator('#credentials').scrollIntoViewIfNeeded();
  const ops = await page.$$eval('#credentials .cred-row', els => els.map(e => getComputedStyle(e).opacity));
  assert.ok(ops.every(o => o === '1'), ops.join(','));
}));

test('MSc row links to the thesis', () => withPage({}, async (page) => {
  assert.equal(await page.locator('#credentials a[href="#project-ghana-card-patch-detection"]').count(), 1);
}));

// ── Live grid ────────────────────────────────────────
test('hero gets a live dot-grid canvas', () => withPage({}, async (page) => {
  const c = page.locator('#hero canvas.hero-grid-canvas');
  assert.equal(await c.count(), 1);
  assert.ok((await c.evaluate(e => e.width)) > 0);
  assert.equal(await c.getAttribute('aria-hidden'), 'true');
}));

test('no grid canvas with reduced motion', () => withPage({ reducedMotion: 'reduce' }, async (page) => {
  assert.equal(await page.locator('#hero canvas').count(), 0);
}));

// ── Ticker ───────────────────────────────────────────
test('ticker sits between hero and work; duplicate copy hidden from screen readers', () => withPage({}, async (page) => {
  const order = await page.evaluate(() => {
    const t = document.querySelector('.ticker'), h = document.getElementById('hero'), w = document.getElementById('work');
    return !!t && (h.compareDocumentPosition(t) & 4) && (t.compareDocumentPosition(w) & 4) ? 'ok' : 'bad';
  });
  assert.equal(order, 'ok');
  const groups = await page.$$eval('.ticker .ticker-group', g => g.map(x => x.getAttribute('aria-hidden')));
  assert.deepEqual(groups, [null, 'true']);
}));

test('ticker is still under reduced motion', () => withPage({ reducedMotion: 'reduce' }, async (page) => {
  assert.equal(await page.locator('.ticker-track').evaluate(e => getComputedStyle(e).animationName), 'none');
}));

// ── Scanner sweep ────────────────────────────────────
test('visible project images get a scanner sweep', () => withPage({}, async (page) => {
  const media = page.locator('#project-mysoc .card-media');
  await media.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.match(await media.getAttribute('class'), /is-scanning/);
  assert.equal(await media.evaluate(e => getComputedStyle(e, '::after').animationName), 'scan');
}));

test('scanner sweep stops when offscreen', () => withPage({}, async (page) => {
  const media = page.locator('#project-mysoc .card-media');
  await media.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  assert.doesNotMatch(await media.getAttribute('class'), /is-scanning/);
}));
