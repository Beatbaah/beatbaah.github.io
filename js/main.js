import { DATA } from './data.js';
import { mountTerminal } from './terminal-ui.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const term = document.querySelector('[data-terminal]');
if (term) mountTerminal(term, DATA, { autotype: !reducedMotion, reducedMotion });

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
