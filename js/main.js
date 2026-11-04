import { DATA } from './data.js';
import { mountTerminal } from './terminal-ui.js';
import { initEffects } from './effects.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Always open at the top: no scroll restore, no jumping to an old #section in the address.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
scrollTo(0, 0);
// In-page links scroll (and move focus) without writing #section into the address.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  const t = a && document.getElementById(a.getAttribute('href').slice(1));
  if (!t) return;
  e.preventDefault();
  t.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
  t.focus({ preventScroll: true });
});

const term = document.querySelector('[data-terminal]');
if (term) mountTerminal(term, DATA, { autotype: !reducedMotion, reducedMotion });
initEffects({ reducedMotion });

// Copy-email button (shown only when the clipboard is available).
document.querySelectorAll('[data-copy]').forEach((btn) => {
  if (!navigator.clipboard) return;
  btn.hidden = false;
  const labels = btn.querySelectorAll('.copy-label');
  const say = (t) => labels.forEach(l => { l.textContent = t; });
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); } catch { return; }
    say('Copied ✓'); btn.classList.add('is-copied');
    setTimeout(() => { say('Copy email'); btn.classList.remove('is-copied'); }, 2000);
  });
});

// Contact form: open the visitor's email app with a pre-filled subject and body.
const form = document.getElementById('contact-form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = (name) => form.elements[name].value.trim();
  const service = v('service');
  const subject = `Portfolio inquiry${service ? ': ' + service : ''}`;
  const body = `Name: ${v('name')}\nEmail: ${v('email')}\n${service ? `Service needed: ${service}\n` : ''}\n${v('message')}`;
  document.getElementById('form-success').hidden = false;
  location.href = `mailto:${DATA.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
