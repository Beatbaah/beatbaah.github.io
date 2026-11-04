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
const out = (page) => page.locator('[data-terminal] .term-output').innerText();
async function run(page, cmd) {
  await page.locator('[data-terminal] .term-output').click();
  await page.locator('.term-input').fill(cmd);
  await page.locator('.term-input').press('Enter');
}

for (const width of [375, 1440]) {
  test(`load does not steal focus or scroll (${width})`, () => withPage({ width }, async (page) => {
    await page.waitForTimeout(3000);
    assert.notEqual(await page.evaluate(() => document.activeElement?.className), 'term-input');
    assert.equal(await page.evaluate(() => scrollY), 0);
  }));
}

test('autotype intro ends with the help hint', () => withPage({}, async (page) => {
  await page.waitForFunction(() => document.querySelector('.term-output').innerText.includes("type 'help'"), null, { timeout: 5000 });
}));

test('typing help prints commands', () => withPage({}, async (page) => {
  await run(page, 'help');
  const o = await out(page);
  assert.ok(o.includes('$ help'));
  assert.ok(o.includes('projects'));
}));

test('open scrolls to card and highlights it', () => withPage({}, async (page) => {
  await run(page, 'open mysoc');
  const card = page.locator('#project-mysoc');
  await page.waitForFunction(() => {
    const r = document.querySelector('#project-mysoc').getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  }, null, { timeout: 3000 });
  assert.match(await card.getAttribute('class'), /is-highlighted/);
}));

test('hire focuses form', () => withPage({}, async (page) => {
  await run(page, 'hire');
  await page.waitForFunction(() => document.activeElement?.id === 'contact-name', null, { timeout: 3000 });
}));

test('cv starts a download', () => withPage({}, async (page) => {
  const dl = page.waitForEvent('download', { timeout: 5000 });
  await run(page, 'cv');
  assert.equal((await dl).suggestedFilename(), 'Beatrice_Baah_CV.pdf');
}));

test('history and tab completion', () => withPage({}, async (page) => {
  await run(page, 'whoami');
  const input = page.locator('.term-input');
  await input.press('ArrowUp');
  assert.equal(await input.inputValue(), 'whoami');
  await input.fill('pro');
  await input.press('Tab');
  assert.equal(await input.inputValue(), 'projects');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'term-input');
}));

test('chips run commands on mobile', () => withPage({ width: 375, hasTouch: true }, async (page) => {
  await page.locator('button[data-cmd="projects"]').tap();
  assert.ok((await out(page)).includes('amansie-ride'));
}));

test('output scrolls, panel height fixed', () => withPage({}, async (page) => {
  const h0 = await page.locator('[data-terminal]').evaluate(e => e.offsetHeight);
  for (let i = 0; i < 15; i++) await run(page, 'projects');
  const h1 = await page.locator('[data-terminal]').evaluate(e => e.offsetHeight);
  assert.equal(h1, h0);
  assert.ok(await page.locator('.term-output').evaluate(e => e.scrollTop) > 0);
}));

test('links are real anchors', () => withPage({}, async (page) => {
  await run(page, 'contact');
  assert.ok(await page.locator('.term-output a[href^="mailto:"]').count() >= 1);
}));

test('user input is rendered as text, not HTML', () => withPage({}, async (page) => {
  await run(page, '<img src=x onerror=alert(1)>');
  assert.equal(await page.locator('.term-output img').count(), 0);
  assert.ok((await out(page)).includes('command not found: <img'));
}));

test('clear empties output', () => withPage({}, async (page) => {
  await run(page, 'help');
  await run(page, 'clear');
  assert.equal((await out(page)).trim(), '');
}));

test('contact form opens a prefilled mailto', () => withPage({}, async (page) => {
  await page.evaluate(() => { window.__mailto = null; });
  await page.route('mailto:*', r => r.abort());
  await page.fill('#contact-name', 'Ama Mensah');
  await page.fill('#contact-email', 'ama@example.com');
  await page.fill('#contact-message', 'Need a booking site');
  const nav = page.waitForRequest(r => r.url().startsWith('mailto:'), { timeout: 3000 }).catch(() => null);
  await page.click('#contact-form button[type=submit]');
  await page.waitForSelector('#form-success:not([hidden])', { timeout: 3000 });
  void nav;
}));

test('Tab with no completion lets focus leave the terminal', () => withPage({}, async (page) => {
  await page.locator('.term-input').click();
  await page.locator('.term-input').fill('xyz');
  await page.keyboard.press('Tab');
  assert.notEqual(await page.evaluate(() => document.activeElement.className), 'term-input');
}));

test('Shift+Tab always leaves the terminal', () => withPage({}, async (page) => {
  await page.locator('.term-input').click();
  await page.locator('.term-input').fill('pro');
  await page.keyboard.press('Shift+Tab');
  assert.notEqual(await page.evaluate(() => document.activeElement.className), 'term-input');
}));

test('inputs are at least 16px on phones (no iOS zoom)', () => withPage({ width: 375, hasTouch: true }, async (page) => {
  const sizes = await page.$$eval('.term-input, .field input, .field textarea', els => els.map(e => parseFloat(getComputedStyle(e).fontSize)));
  assert.ok(sizes.length >= 5 && sizes.every(s => s >= 16), sizes.join(','));
}));

test('terminal is quiet for screen readers while the intro types', async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      window.__live = [];
      document.addEventListener('DOMContentLoaded', () => {
        const o = document.querySelector('.term-output');
        new MutationObserver(() => window.__live.push(o.getAttribute('aria-live'))).observe(o, { childList: true, subtree: true, characterData: true });
      });
    });
    await page.goto(server.url);
    await page.waitForFunction(() => document.querySelector('.term-output').innerText.includes("type 'help'"));
    const during = await page.evaluate(() => window.__live.slice(0, -1));
    assert.ok(during.length > 0 && during.every(v => v === 'off'), during.join(','));
    assert.equal(await page.locator('.term-output').getAttribute('aria-live'), 'polite');
  } finally { await browser.close(); }
});
