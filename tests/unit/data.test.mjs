import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DATA } from '../../js/data.js';

const all = () => [...DATA.featured, ...DATA.more];

test('featured has the five slugs in order', () => {
  assert.deepEqual(DATA.featured.map(p => p.slug),
    ['proassess', 'amansie-ride', 'mysoc', 'bma-website', 'ghana-card-patch-detection']);
});

test('all slugs unique and kebab-case', () => {
  const slugs = all().map(p => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/);
});

test('every project has title, tagline, non-empty stack', () => {
  for (const p of all()) {
    assert.ok(p.title, `${p.slug} title`);
    assert.ok(p.tagline, `${p.slug} tagline`);
    assert.ok(Array.isArray(p.stack) && p.stack.length > 0, `${p.slug} stack`);
  }
});

test('thesis: TensorFlow/Keras, no headline stat for now', () => {
  const t = DATA.featured[4];
  assert.equal(t.stat, undefined);
  assert.ok(t.stack.includes('tensorflow') && t.stack.includes('keras'));
  assert.doesNotMatch(JSON.stringify(t), /pytorch|101/i);
});

test('contact has no instagram/tiktok', () => {
  assert.deepEqual(Object.keys(DATA.contact), ['email', 'linkedin', 'github', 'whatsapp']);
});

test('amansie copy is area-neutral', () => {
  const a = DATA.featured.find(p => p.slug === 'amansie-ride');
  assert.doesNotMatch(a.tagline, /bekwai/i);
});

test('cv path points at the bundled PDF', () => {
  assert.equal(DATA.cvPath, 'assets/Beatrice_Baah_CV.pdf');
});
