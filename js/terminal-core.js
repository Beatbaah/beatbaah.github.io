// Pure terminal logic: no DOM. execute() returns lines to print and an optional action for the UI.
// Line = Segment[]; Segment = { text, kind?: 'muted'|'accent'|'error', href? }

export const COMMANDS = ['help', 'whoami', 'projects', 'open', 'stack', 'experience', 'certs', 'contact', 'hire', 'cv', 'clear'];

const HELP = {
  help: 'list commands', whoami: 'who is beatrice?', projects: 'list my work', open: 'open <project>: jump to a project',
  stack: 'tools I use', experience: 'work history (--go to jump there)', certs: 'certifications',
  contact: 'ways to reach me', hire: 'start a conversation', cv: 'download my CV', clear: 'clear the screen',
};

const seg = (text, kind, href) => ({ text, ...(kind && { kind }), ...(href && { href }) });
const line = (...segs) => segs.map(s => (typeof s === 'string' ? seg(s) : s));
const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
const projects = (data) => [...data.featured, ...data.more];

const handlers = {
  help: () => COMMANDS.map(c => line(seg(pad(c, 12), 'accent'), seg(HELP[c], 'muted'))),
  whoami: (_, d) => d.bio.whoami.map(t => line(t)),
  projects: (_, d) => [
    line(seg('// featured', 'muted')),
    ...d.featured.map(p => line(seg(pad(p.slug, 28), 'accent'), p.tagline)),
    line(seg('// more', 'muted')),
    ...d.more.map(p => line(seg(pad(p.slug, 28), 'accent'), p.tagline)),
    line(seg("try: open <project>", 'muted')),
  ],
  open: (arg, d) => {
    const list = () => line(seg(projects(d).map(p => p.slug).join(' · '), 'muted'));
    if (!arg) return { lines: [line('usage: open <project>'), list()], action: null };
    const p = projects(d).find(x => x.slug === arg) || projects(d).find(x => x.slug.startsWith(arg));
    if (!p) return { lines: [line(seg(`no project "${arg}". try one of:`, 'error')), list()], action: null };
    return { lines: [line(seg('→ ', 'accent'), `opening ${p.title}…`)], action: { type: 'scroll', target: `#project-${p.slug}` } };
  },
  stack: (_, d) => d.capabilities.map(c => line(seg(pad(c.title, 28), 'accent'), c.tools.join(' · '))),
  experience: (arg, d) => ({
    lines: [
      ...d.experience.map(e => line(seg(pad(`${e.start} → ${e.end}`, 22), 'muted'), `${e.title}, ${e.org}`)),
      ...d.education.map(e => line(seg(pad(e.end || '', 22), 'muted'), `${e.title}, ${e.org}`)),
    ],
    action: arg === '--go' ? { type: 'scroll', target: '#background' } : null,
  }),
  certs: (_, d) => d.certs.map(c => line(seg(pad(c.date, 10), 'muted'), c.name, seg(c.issuer ? ` · ${c.issuer}` : '', 'muted'))),
  contact: (_, d) => [
    line(seg(pad('email', 10), 'muted'), seg(d.contact.email, 'accent', `mailto:${d.contact.email}`)),
    line(seg(pad('linkedin', 10), 'muted'), seg(d.contact.linkedin.replace('https://', ''), 'accent', d.contact.linkedin)),
    line(seg(pad('github', 10), 'muted'), seg(d.contact.github.replace('https://', ''), 'accent', d.contact.github)),
    line(seg(pad('whatsapp', 10), 'muted'), seg('+233 24 598 9981', 'accent', d.contact.whatsapp)),
  ],
  hire: () => ({ lines: [line(seg('→ ', 'accent'), "great. let's talk. opening the contact form…")], action: { type: 'focus', target: '#contact-name' } }),
  cv: (_, d) => ({ lines: [line(seg('→ ', 'accent'), 'downloading Beatrice_Baah_CV.pdf…')], action: { type: 'download', href: d.cvPath } }),
  clear: () => ({ lines: [], action: { type: 'clear' } }),
  sudo: () => [line('nice try. this incident has been logged to mySOC.')],
};

export function execute(input, data) {
  const norm = String(input).trim().replace(/\s+/g, ' ').toLowerCase();
  if (!norm) return { lines: [], action: null };
  const [cmd, ...rest] = norm.split(' ');
  const handler = Object.hasOwn(handlers, cmd) ? handlers[cmd] : null;
  if (!handler) return { lines: [line(seg(`command not found: ${cmd} — try 'help'`, 'error'))], action: null };
  const out = handler(rest.join(' '), data);
  return Array.isArray(out) ? { lines: out, action: null } : out;
}

export function complete(partial, data) {
  const norm = String(partial).replace(/^\s+/, '').replace(/\s+/g, ' ').toLowerCase();
  if (norm.startsWith('open ')) {
    const arg = norm.slice(5);
    return projects(data).map(p => p.slug).filter(s => s.startsWith(arg)).map(s => `open ${s}`);
  }
  if (!norm) return [];
  return COMMANDS.filter(c => c.startsWith(norm));
}

export function createHistory() {
  const items = [];
  let idx = 0;
  return {
    push(cmd) { if (cmd && items[items.length - 1] !== cmd) items.push(cmd); idx = items.length; },
    prev() { if (!items.length) return null; idx = Math.max(0, idx - 1); return items[idx]; },
    next() { if (!items.length) return null; idx = Math.min(items.length, idx + 1); return idx === items.length ? '' : items[idx]; },
  };
}
