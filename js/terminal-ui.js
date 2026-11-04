import { execute, complete, createHistory } from './terminal-core.js';

const PROMPT = 'beatrice@portfolio:~$';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function renderLine(segments) {
  const div = document.createElement('div');
  div.className = 'term-line';
  for (const s of segments) {
    const el = document.createElement(s.href ? 'a' : 'span');
    el.textContent = s.text;
    if (s.kind) el.className = `k-${s.kind}`;
    if (s.href) {
      el.href = s.href;
      if (/^https?:/.test(s.href)) { el.target = '_blank'; el.rel = 'noopener'; }
    }
    div.append(el);
  }
  return div;
}

/** Wire up the [data-terminal] panel. Never focuses the input or scrolls on load. */
export function mountTerminal(root, data, { autotype = true, reducedMotion = false } = {}) {
  const output = root.querySelector('.term-output');
  const form = root.querySelector('.term-form');
  const input = root.querySelector('.term-input');
  const chips = root.querySelector('.term-chips');
  const history = createHistory();

  const print = (segments) => { output.append(renderLine(segments)); output.scrollTop = output.scrollHeight; };
  const echo = (cmd) => print([{ text: '$ ', kind: 'accent' }, { text: cmd }]);

  function act(action) {
    if (!action) return;
    if (action.type === 'clear') { output.replaceChildren(); return; }
    if (action.type === 'download') {
      const a = Object.assign(document.createElement('a'), { href: action.href, download: '' });
      document.body.append(a); a.click(); a.remove();
      return;
    }
    const target = document.querySelector(action.target);
    if (!target) return;
    if (action.type === 'scroll') {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      target.classList.add('is-highlighted');
      setTimeout(() => target.classList.remove('is-highlighted'), 2000);
    } else if (action.type === 'focus') {
      document.querySelector('#contact')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  }

  function run(cmd) {
    echo(cmd);
    history.push(cmd.trim());
    const { lines, action } = execute(cmd, data);
    lines.forEach(print);
    act(action);
  }

  let introDone = false;
  const finishIntro = () => { introDone = true; output.setAttribute('aria-live', 'polite'); };
  async function intro() {
    output.setAttribute('aria-live', 'off');
    output.replaceChildren();
    if (autotype) {
      const line = renderLine([{ text: '$ ', kind: 'accent' }, { text: '' }]);
      output.append(line);
      const typed = line.lastChild;
      for (const ch of 'whoami') { if (introDone) return; typed.textContent += ch; await wait(70); }
      await wait(250);
    } else {
      echo('whoami');
    }
    if (introDone) return;
    execute('whoami', data).lines.forEach(print);
    print([{ text: "type 'help' to explore, or tap a command below.", kind: 'muted' }]);
    finishIntro();
  }

  form.hidden = false;
  chips.hidden = false;
  intro();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!introDone) { finishIntro(); output.replaceChildren(); }
    const cmd = input.value;
    input.value = '';
    if (!cmd.trim()) { echo(''); return; }
    run(cmd);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const v = e.key === 'ArrowUp' ? history.prev() : history.next();
      if (v !== null) { e.preventDefault(); input.value = v; }
    } else if (e.key === 'Tab' && !e.shiftKey && input.value.trim()) {
      const options = complete(input.value, data);
      if (!options.length) return; // let Tab move focus on
      e.preventDefault();
      if (options.length === 1) input.value = options[0];
      else if (options.length > 1) { echo(input.value); print([{ text: options.join('   '), kind: 'muted' }]); }
    }
  });

  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cmd]');
    if (!btn) return;
    if (!introDone) { finishIntro(); output.replaceChildren(); }
    run(btn.dataset.cmd);
  });

  // Clicking anywhere in the panel (except links/buttons) focuses the prompt.
  root.addEventListener('click', (e) => {
    if (e.target.closest('a, button') || getSelection().toString()) return;
    input.focus({ preventScroll: true });
  });
}
