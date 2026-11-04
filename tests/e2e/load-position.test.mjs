import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, openPage, ROOT } from './helpers.mjs';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

async function withPage(url, opts, fn) {
  const { page, browser } = await openPage(url, opts);
  try { await fn(page); } finally { await browser.close(); }
}
const settledY = async (page) => { await page.waitForTimeout(1500); return page.evaluate(() => Math.round(scrollY)); };
const inView = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, sel);

test('in-page links scroll without adding a #hash to the address', () => withPage(server.url, {}, async (page) => {
  await page.click('#hero a[href="#work"]');
  await page.waitForTimeout(1200);
  assert.equal(await page.evaluate(() => location.hash), '');
  assert.ok(await inView(page, '#work'));
  await page.click('.nav a[href="#contact"]');
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => location.hash), '');
  assert.ok(await inView(page, '#contact'));
}));

test('reload after clicking View work opens at the top', () => withPage(server.url, {}, async (page) => {
  await page.click('#hero a[href="#work"]');
  await page.waitForTimeout(1200);
  await page.reload();
  assert.equal(await settledY(page), 0);
}));

test('reload after scrolling down opens at the top', () => withPage(server.url, {}, async (page) => {
  await page.evaluate(() => scrollTo({ top: 2500, behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.reload();
  assert.equal(await settledY(page), 0);
}));

test('an old #work address still opens at the top and is cleaned', () => withPage(server.url + '#work', {}, async (page) => {
  assert.equal(await settledY(page), 0);
  assert.equal(await page.evaluate(() => location.hash), '');
}));

test('skip link moves keyboard focus into the work section', () => withPage(server.url, {}, async (page) => {
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  assert.ok(await page.evaluate(() => document.getElementById('work').contains(document.activeElement)));
}));
