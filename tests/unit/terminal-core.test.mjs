import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DATA } from '../../js/data.js';
import { execute, complete, createHistory, COMMANDS } from '../../js/terminal-core.js';

const text = (lines) => lines.map(l => l.map(s => s.text).join('')).join('\n');
const run = (input) => execute(input, DATA);

test('COMMANDS list', () => {
  assert.deepEqual(COMMANDS, ['help', 'whoami', 'projects', 'open', 'stack', 'experience', 'certs', 'contact', 'hire', 'cv', 'clear']);
});

test('help lists every command', () => {
  const out = text(run('help').lines);
  for (const c of COMMANDS) assert.ok(out.includes(c), c);
});

test('whoami prints the bio', () => {
  assert.ok(text(run('whoami').lines).includes('Beatrice Baah. Software & AI engineer.'));
});

test('input is trimmed and case-insensitive', () => {
  assert.deepEqual(run('  OPEN   MySOC ').action, { type: 'scroll', target: '#project-mysoc' });
});

test('open with no arg prints usage and slugs', () => {
  const r = run('open');
  assert.ok(text(r.lines).includes('usage: open <project>'));
  assert.ok(text(r.lines).includes('proassess'));
  assert.equal(r.action, null);
});

test('open unknown suggests', () => {
  const r = run('open foo');
  assert.ok(text(r.lines).includes('no project "foo"'));
  assert.ok(text(r.lines).includes('mysoc'));
  assert.equal(r.action, null);
});

test('open matches more-work projects', () => {
  assert.deepEqual(run('open haske').action, { type: 'scroll', target: '#project-haske' });
});

test('projects lists featured and more', () => {
  const out = text(run('projects').lines);
  assert.ok(out.includes('amansie-ride'));
  assert.ok(out.includes('dream-trip-planner'));
});

test('empty input', () => {
  assert.deepEqual(run('   '), { lines: [], action: null });
});

test('experience --go scrolls', () => {
  assert.deepEqual(run('experience --go').action, { type: 'scroll', target: '#background' });
  assert.equal(run('experience').action, null);
  assert.ok(text(run('experience').lines).includes('Municipal Statistician'));
});

test('stack and certs print content', () => {
  assert.ok(text(run('stack').lines).includes('fastapi'));
  assert.ok(text(run('certs').lines).includes('Google Cybersecurity Certificate'));
});

test('hire focuses form', () => {
  assert.deepEqual(run('hire').action, { type: 'focus', target: '#contact-name' });
});

test('cv downloads', () => {
  assert.deepEqual(run('cv').action, { type: 'download', href: 'assets/Beatrice_Baah_CV.pdf' });
});

test('clear', () => {
  assert.deepEqual(run('clear').action, { type: 'clear' });
});

test('contact segments are links', () => {
  const segs = run('contact').lines.flat();
  assert.ok(segs.some(s => s.href === 'mailto:beatrice.baah3@hotmail.com'));
  assert.ok(segs.some(s => s.href === 'https://github.com/Beatbaah'));
});

test('sudo easter egg', () => {
  assert.equal(text(run('sudo rm -rf /').lines), 'nice try. this incident has been logged to mySOC.');
});

test('unknown command', () => {
  const r = run('xyz');
  assert.equal(text(r.lines), "command not found: xyz — try 'help'");
  assert.equal(r.lines[0][0].kind, 'error');
});

test('complete', () => {
  assert.deepEqual(complete('pr', DATA), ['projects']);
  assert.deepEqual(complete('open m', DATA), ['open mysoc']);
  assert.deepEqual(complete('zz', DATA), []);
  assert.deepEqual(complete('c', DATA), ['certs', 'contact', 'cv', 'clear']);
});

test('history', () => {
  const h = createHistory();
  h.push('a'); h.push('b');
  assert.equal(h.prev(), 'b');
  assert.equal(h.prev(), 'a');
  assert.equal(h.prev(), 'a');
  assert.equal(h.next(), 'b');
  assert.equal(h.next(), '');
});

test('history on empty returns null', () => {
  const h = createHistory();
  assert.equal(h.prev(), null);
  assert.equal(h.next(), null);
});
