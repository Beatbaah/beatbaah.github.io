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
const EMAIL = 'beatrice.baah3@hotmail.com';
async function fillForm(page) {
  await page.fill('#contact-name', 'Ama Mensah');
  await page.fill('#contact-email', 'ama@example.com');
  await page.fill('#contact-service', 'booking site');
  await page.fill('#contact-message', 'Need a booking site');
}

// ── D1 · contact form actually sends ─────────────────
test('form sends through FormSubmit without leaving the page', () => withPage({}, async (page) => {
  let body = null;
  await page.route('https://formsubmit.co/**', async r => {
    body = r.request().postDataJSON();
    await r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
  });
  await fillForm(page);
  await page.click('#contact-form button[type=submit]');
  await page.waitForSelector('#form-success:not([hidden])');
  assert.match(await page.locator('#form-success').innerText(), /sent/i);
  assert.equal(body.name, 'Ama Mensah');
  assert.equal(body.email, 'ama@example.com');
  assert.match(body._subject, /booking site/);
  assert.equal(await page.locator('#contact-message').inputValue(), '', 'form resets');
}));

test('form falls back to the email app if the service fails', () => withPage({}, async (page) => {
  await page.route('https://formsubmit.co/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"false","message":"needs activation"}' }));
  await fillForm(page);
  const mail = page.waitForRequest(r => r.url().startsWith('mailto:'), { timeout: 4000 });
  await page.route('mailto:*', r => r.abort());
  await page.click('#contact-form button[type=submit]');
  assert.match((await mail).url(), /^mailto:beatrice\.baah3%40hotmail\.com|^mailto:beatrice\.baah3@hotmail\.com/);
  await page.waitForSelector('#form-success:not([hidden])');
  assert.match(await page.locator('#form-success').innerText(), /email app/i);
}));

test('form posts to FormSubmit without JS, with a hidden honeypot', () => withPage({ javaScriptEnabled: false }, async (page) => {
  const f = page.locator('#contact-form');
  assert.equal(await f.getAttribute('action'), `https://formsubmit.co/${EMAIL}`);
  assert.equal(await f.getAttribute('method'), 'post');
  assert.equal(await page.locator('#contact-form input[name="_honey"]').isVisible(), false);
}));

// ── D2 · analytics, off until configured ─────────────
test('no analytics request while no GoatCounter code is set; CV clicks are tagged', () => withPage({}, async (page) => {
  const hits = [];
  page.on('request', r => { if (/goatcounter|gc\.zgo\.at/.test(r.url())) hits.push(r.url()); });
  await page.reload({ waitUntil: 'networkidle' });
  assert.deepEqual(hits, []);
  assert.equal(await page.locator('meta[name="goatcounter"]').count(), 1);
  assert.ok(await page.locator('a[download][data-goatcounter-click]').count() >= 2);
}));

// ── D3 · SEO basics ──────────────────────────────────
test('canonical link and Person structured data', () => withPage({}, async (page) => {
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://beatbaah.github.io/');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  assert.equal(ld['@type'], 'Person');
  assert.equal(ld.name, 'Beatrice Baah');
  assert.match(ld.jobTitle, /Software/);
  assert.ok(ld.sameAs.includes('https://github.com/Beatbaah'));
  assert.ok(ld.sameAs.includes('https://linkedin.com/in/bbaah2'));
}));

test('robots.txt and sitemap.xml exist', async () => {
  const robots = await (await fetch(server.url + 'robots.txt')).text();
  assert.match(robots, /Sitemap: https:\/\/beatbaah\.github\.io\/sitemap\.xml/);
  const res = await fetch(server.url + 'sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<loc>https:\/\/beatbaah\.github\.io\/<\/loc>/);
});

// ── R4 / R5 · honest claims ──────────────────────────
test('BMA card is described as a proposed redesign', () => withPage({}, async (page) => {
  const t = await page.locator('#project-bma-website').innerText();
  assert.match(t, /Proposed redesign/);
  assert.doesNotMatch(t, /Replaced an end-of-life/);
}));

test('hero stats say built, not shipped', () => withPage({}, async (page) => {
  const t = await page.locator('#hero .stats').innerText();
  assert.doesNotMatch(t, /shipped/);
  assert.match(t, /products built\s*10/);
}));

test('Excellent Susu links to the live app', () => withPage({}, async (page) => {
  assert.equal(await page.locator('#project-excellent-susu a[href="https://excellent-susu-app.web.app"]').count(), 1);
}));

test('phone hero stats sit on one row', () => withPage({ width: 375 }, async (page) => {
  const tops = await page.$$eval('#hero .stats > div', els => els.map(e => Math.round(e.getBoundingClientRect().top)));
  assert.equal(new Set(tops).size, 1, tops.join(','));
}));
