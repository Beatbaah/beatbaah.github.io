import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, openPage, ROOT } from './helpers.mjs';
import { DATA } from '../../js/data.js';

let server;
before(async () => { server = await startServer(ROOT); });
after(async () => { await server.close(); });

// Claims the Main CV (Nov 2026) no longer makes; the site must not make them either.
const DROPPED = ['100K+', '100,000', '161 communities', '130,000', '20 financial models', 'GHS 4M',
  '13,050', '87,556', '93,833', 'reducing operational errors by 50%', 'Data Analyst Intern', 'boosting throughput'];

test('page makes no claims the CV dropped', async () => {
  const { page, browser } = await openPage(server.url);
  try {
    const text = await page.locator('body').innerText();
    for (const s of DROPPED) assert.ok(!text.includes(s), s);
    const log = await page.locator('#background .log').evaluate(e => e.textContent);
    for (const s of ['Acting Head, Statistics Department', '188 field staff across 288 enumeration zones',
      '186 enumeration areas', 'Data Analyst (National Service)', '2024-11 → 2024-12'])
      assert.ok(log.includes(s), s);
  } finally { await browser.close(); }
});

test('DATA (terminal) matches the CV too', () => {
  const json = JSON.stringify(DATA);
  for (const s of DROPPED) assert.ok(!json.includes(s), s);
  const ec = DATA.experience.find(e => /Collation/.test(e.title));
  assert.equal(ec.start, '2024-11');
  assert.equal(DATA.more.find(p => p.slug === 'tax-system').title, 'Bekwai Tax Revenue');
});
