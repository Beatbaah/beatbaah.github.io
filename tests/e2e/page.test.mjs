import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, openPage, ROOT } from './helpers.mjs';
import { DATA } from '../../js/data.js';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

async function withPage(opts, fn) {
  const { page, browser } = await openPage(server.url, opts);
  try { await fn(page); } finally { await browser.close(); }
}

test('has six sections in order', () => withPage({}, async (page) => {
  const ids = await page.$$eval('main > section[id]', els => els.map(e => e.id));
  assert.deepEqual(ids, ['hero', 'work', 'capabilities', 'background', 'testimonials', 'contact']);
}));

test('every DATA project has a matching element', () => withPage({}, async (page) => {
  for (const p of [...DATA.featured, ...DATA.more]) {
    const el = page.locator(`#project-${p.slug}`);
    assert.equal(await el.count(), 1, p.slug);
    assert.ok((await el.innerText()).includes(p.title), `${p.slug} title`);
  }
}));

test('no social handles', () => withPage({}, async (page) => {
  const html = (await page.content()).toLowerCase();
  for (const s of ['instagram', 'tiktok', 'larahvega', 'la_rah_ve_ga']) assert.ok(!html.includes(s), s);
}));

test('CV link', () => withPage({}, async (page) => {
  assert.ok(await page.locator('a[download][href="assets/Beatrice_Baah_CV.pdf"]').count() >= 1);
  const res = await page.request.get(server.url + 'assets/Beatrice_Baah_CV.pdf');
  assert.equal(res.status(), 200);
}));

test('all content visible with JS disabled', () => withPage({ javaScriptEnabled: false }, async (page) => {
  const ops = await page.$$eval('[data-reveal]', els => els.map(e => getComputedStyle(e).opacity));
  assert.ok(ops.length > 5, 'has reveal elements');
  assert.ok(ops.every(o => o === '1'), `opacities: ${ops.join(',')}`);
  assert.ok((await page.locator('[data-terminal] .term-output').innerText()).includes('Software & AI engineer'));
}));

test('no horizontal scroll at 375', () => withPage({ width: 375 }, async (page) => {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= 375);
}));

test('images have dimensions and lazy loading below the fold', () => withPage({}, async (page) => {
  const imgs = await page.$$eval('img', els => els.map(e => ({
    src: e.getAttribute('src'), w: e.getAttribute('width'), h: e.getAttribute('height'),
    lazy: e.getAttribute('loading'), top: e.getBoundingClientRect().top,
  })));
  assert.ok(imgs.length > 0);
  for (const i of imgs) {
    assert.ok(i.w && i.h, `${i.src} dimensions`);
    if (i.top > 900) assert.equal(i.lazy, 'lazy', `${i.src} lazy`);
  }
}));

test('section targets used by the terminal exist', () => withPage({}, async (page) => {
  for (const sel of ['#work', '#background', '#contact', '#contact-name']) {
    assert.equal(await page.locator(sel).count(), 1, sel);
  }
}));

test('404 page is on brand', async () => {
  const { page, browser } = await openPage(server.url + 'nope');
  try { assert.ok((await page.content()).includes('no such page')); } finally { await browser.close(); }
});
