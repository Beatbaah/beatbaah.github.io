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

// ── B · floating 3D terminal ─────────────────────────
test('hero terminal tilts toward the cursor and resets on leave', () => withPage({}, async (page) => {
  const wrap = page.locator('.terminal-3d');
  const b = await wrap.boundingBox();
  await page.mouse.move(b.x + b.width - 10, b.y + 10);
  await page.waitForTimeout(100);
  assert.match(await wrap.evaluate(e => e.style.transform), /rotateY/);
  await page.mouse.move(5, 880); // leave the hero
  await page.waitForTimeout(100);
  assert.equal(await wrap.evaluate(e => e.style.transform), '');
}));

test('floating chips are decorative and hidden on phones', () => withPage({ width: 375 }, async (page) => {
  const chips = page.locator('.terminal-3d .float-chip');
  assert.equal(await chips.count(), 3);
  assert.equal(await page.locator('.float-chips').getAttribute('aria-hidden'), 'true');
  assert.deepEqual(await chips.evaluateAll(els => els.map(e => getComputedStyle(e).display)), ['none', 'none', 'none']);
}));

test('no terminal tilt on touch or reduced motion', async () => {
  for (const opts of [{ width: 375, hasTouch: true }, { reducedMotion: 'reduce' }]) {
    await withPage(opts, async (page) => {
      const wrap = page.locator('.terminal-3d');
      const b = await wrap.boundingBox();
      await page.mouse.move(b.x + 10, b.y + 10);
      await page.waitForTimeout(100);
      assert.equal(await wrap.evaluate(e => e.style.transform), '', JSON.stringify(opts));
    });
  }
});

// ── D · pop-out project cards ────────────────────────
test('featured card tilts and its layers lift on hover', () => withPage({}, async (page) => {
  const card = page.locator('#project-mysoc');
  await card.scrollIntoViewIfNeeded();
  const b = await card.boundingBox();
  await page.mouse.move(b.x + b.width * 0.8, b.y + 40);
  await page.waitForTimeout(450);
  assert.match(await card.evaluate(e => e.style.transform), /rotateX/);
  const z = await card.locator('h3').evaluate(e => getComputedStyle(e).transform);
  assert.notEqual(z, 'none', 'title is lifted in 3D');
}));

test('card tilt off under reduced motion', () => withPage({ reducedMotion: 'reduce' }, async (page) => {
  const card = page.locator('#project-mysoc');
  await card.scrollIntoViewIfNeeded();
  const b = await card.boundingBox();
  await page.mouse.move(b.x + b.width * 0.8, b.y + 40);
  await page.waitForTimeout(200);
  assert.equal(await card.evaluate(e => e.style.transform), '');
}));

// ── A · globe behind contact ─────────────────────────
test('contact has a decorative globe that only runs on screen', () => withPage({}, async (page) => {
  const cv = page.locator('#contact .globe-slot canvas');
  assert.equal(await cv.count(), 1);
  assert.equal(await page.locator('#contact .globe-slot').getAttribute('aria-hidden'), 'true');
  assert.equal(await cv.getAttribute('data-running'), 'false');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await cv.getAttribute('data-running'), 'true');
  assert.ok(await cv.evaluate(e => e.width) > 0);
}));

test('globe is still (single frame) under reduced motion', () => withPage({ reducedMotion: 'reduce' }, async (page) => {
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#contact .globe-slot canvas').getAttribute('data-running'), 'false');
}));

test('no globe slot shown without JS', () => withPage({ javaScriptEnabled: false }, async (page) => {
  assert.equal(await page.locator('#contact .globe-slot').isVisible(), false);
}));

test('globe is the background of the whole contact panel', () => withPage({}, async (page) => {
  await page.locator('#contact').scrollIntoViewIfNeeded();
  const [panel, slot] = await page.evaluate(() => {
    const p = document.querySelector('.contact-panel'), r = document.querySelector('#contact .globe-slot').getBoundingClientRect();
    return [[p.clientWidth, p.clientHeight], [Math.round(r.width), Math.round(r.height)]]; // inside the panel's border
  });
  assert.deepEqual(slot, panel, 'slot fills the panel');
  assert.equal(await page.locator('#contact .globe-slot').evaluate(e => getComputedStyle(e).pointerEvents), 'none');
}));

test('content above the globe stays clickable', () => withPage({}, async (page) => {
  for (const sel of ['.cp-actions a[href^="mailto:"]', '#contact-name', '#contact-form button[type=submit]']) {
    const el = page.locator(`#contact ${sel}`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    const hit = await page.evaluate(([x, y, s]) => document.elementFromPoint(x, y)?.closest(s) !== null, [b.x + b.width / 2, b.y + b.height / 2, `#contact ${sel}`]);
    assert.ok(hit, sel);
  }
}));

test('globe turns toward the cursor across the panel', () => withPage({}, async (page) => {
  await page.locator('#contact').scrollIntoViewIfNeeded();
  const b = await page.locator('.contact-panel').boundingBox();
  await page.mouse.move(b.x + b.width * 0.9, b.y + 100);
  await page.waitForTimeout(150);
  const steer = await page.locator('#contact .globe-slot canvas').getAttribute('data-steer');
  assert.ok(Number(steer) > 0, `steer=${steer}`);
}));
