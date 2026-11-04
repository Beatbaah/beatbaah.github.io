// Motion and interaction polish. Everything here is optional: the page is complete without it.

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFX';

/** Scramble el's text, resolving left→right over ~durationMs. Screen readers get the real text via aria-label. */
export function decrypt(el, durationMs = 600) {
  if (el.dataset.decrypted) return;
  el.dataset.decrypted = '1';
  const target = el.textContent;
  el.setAttribute('aria-label', target);
  const start = performance.now();
  const frame = (now) => {
    const progress = Math.min(1, (now - start) / durationMs);
    const solved = Math.floor(progress * target.length);
    el.textContent = [...target].map((c, i) =>
      i < solved || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  };
  requestAnimationFrame(frame);
}

function initReveals() {
  const els = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      el.classList.add('is-visible');
      if (el.matches('[data-decrypt]')) decrypt(el);
      io.unobserve(el);
    }
  }, { threshold: 0.2 });
  els.forEach((el) => {
    // small stagger between siblings that reveal together
    const i = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal')).indexOf(el);
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });
}

function initProgress() {
  const bar = document.getElementById('progress');
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

function initSpotlight() {
  if (matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', `${Math.round(e.clientX - r.left)}px`);
      card.style.setProperty('--y', `${Math.round(e.clientY - r.top)}px`);
    });
  });
}

function initCarousel(reducedMotion) {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const slides = [...root.querySelectorAll('.slide')];
  const count = root.querySelector('.carousel-count');
  let i = 0, hovering = false, focused = false, stopped = reducedMotion;
  const toggle = root.querySelector('[data-action="toggle"]');
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (count) count.textContent = `${i + 1} / ${slides.length}`;
  };
  root.classList.add('is-enhanced');
  root.querySelector('.carousel-controls').hidden = false;
  const setStopped = (v) => {
    stopped = v;
    toggle.setAttribute('aria-pressed', String(v));
    toggle.setAttribute('aria-label', v ? 'Play testimonials' : 'Pause testimonials');
    toggle.textContent = v ? '▶' : '❚❚';
  };
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="toggle"]')) { setStopped(!stopped); return; }
    const b = e.target.closest('button[data-dir]');
    if (b) show(i + (b.dataset.dir === 'next' ? 1 : -1));
  });
  root.addEventListener('pointerenter', () => { hovering = true; });
  root.addEventListener('pointerleave', () => { hovering = false; });
  root.addEventListener('focusin', () => { focused = true; });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) focused = false; });
  setStopped(stopped);
  show(0);
  setInterval(() => { if (!stopped && !hovering && !focused && !document.hidden) show(i + 1); }, 6000);
}

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Primary buttons lean toward a nearby mouse cursor. */
function initMagnetic() {
  if (!finePointer()) return;
  const btns = [...document.querySelectorAll('.btn-primary')];
  let frame = 0, mx = 0, my = 0;
  const apply = () => {
    frame = 0;
    for (const b of btns) {
      const r = b.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
      const reach = r.width / 2 + 60;
      b.style.transform = Math.hypot(dx, dy) < reach ? `translate(${dx * 0.25}px, ${dy * 0.3}px)` : '';
    }
  };
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; if (!frame) frame = requestAnimationFrame(apply); }, { passive: true });
}

/** Live dot grid behind the hero: slow ripple, glows toward the cursor. Paused when offscreen. */
function initLiveGrid() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const cv = document.createElement('canvas');
  cv.className = 'hero-grid-canvas';
  cv.setAttribute('aria-hidden', 'true');
  hero.prepend(cv);
  hero.classList.add('has-live-grid');
  const ctx = cv.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  let mx = -1e4, my = -1e4, visible = true, raf = 0;
  const size = () => { cv.width = hero.clientWidth * dpr; cv.height = hero.clientHeight * dpr; };
  size();
  addEventListener('resize', size);
  if (finePointer()) {
    hero.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * dpr; my = (e.clientY - r.top) * dpr; });
    hero.addEventListener('pointerleave', () => { mx = my = -1e4; });
  }
  const draw = (t) => {
    raf = 0;
    if (!visible) return;
    const g = 28 * dpr, R = 140 * dpr, tt = t / 1000;
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (let x = g / 2; x < cv.width; x += g) {
      for (let y = g / 2; y < cv.height; y += g) {
        const dx = mx - x, dy = my - y, k = Math.max(0, 1 - Math.hypot(dx, dy) / R);
        const wave = (Math.sin(x / 110 + y / 80 - tt * 1.4) + 1) * 0.06;
        ctx.fillStyle = k > 0 ? `rgba(198,243,107,${0.1 + wave + k * 0.8})` : `rgba(255,255,255,${0.06 + wave})`;
        ctx.beginPath();
        ctx.arc(x + dx * k * 0.14, y + dy * k * 0.14, (1 + k * 1.5) * dpr, 0, 7);
        ctx.fill();
      }
    }
    raf = requestAnimationFrame(draw);
  };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(draw); }).observe(hero);
}

/** Scanner sweep runs only on project images that are on screen. */
function initScanner() {
  const media = document.querySelectorAll('.card-media:has(img)');
  const io = new IntersectionObserver((entries) => entries.forEach(en => en.target.classList.toggle('is-scanning', en.isIntersecting)));
  media.forEach((m, i) => { m.style.setProperty('--scan-delay', `${(i % 3) * 1.4}s`); io.observe(m); });
}

/** "verify --credentials": rows tick one by one when the panel scrolls into view. */
function initCredentials() {
  const panel = document.getElementById('credentials');
  if (!panel) return;
  const rows = [...panel.querySelectorAll('.cred-row')];
  const status = panel.querySelector('.cred-status');
  const rerun = panel.querySelector('[data-action="rerun"]');
  let timers = [];
  const run = () => {
    timers.forEach(clearTimeout);
    rows.forEach(r => r.classList.remove('is-ok'));
    status.textContent = `0/${rows.length} verifying…`;
    timers = rows.map((r, i) => setTimeout(() => {
      r.classList.add('is-ok');
      status.textContent = i === rows.length - 1 ? `${rows.length}/${rows.length} verified` : `${i + 1}/${rows.length} verifying…`;
    }, 250 + i * 200));
  };
  panel.classList.add('is-pending');
  rows.forEach(r => r.classList.remove('is-ok'));
  status.textContent = `0/${rows.length} verifying…`;
  rerun.hidden = false;
  rerun.addEventListener('click', run);
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.3 });
  io.observe(panel);
}

export function initEffects({ reducedMotion }) {
  initProgress();
  initSpotlight();
  initCarousel(reducedMotion);
  if (reducedMotion) return; // content stays fully visible; no scramble, no slide-in, no live effects
  document.documentElement.classList.add('fx');
  initMagnetic();
  initLiveGrid();
  initScanner();
  initCredentials();
  const hero = document.querySelector('h1 [data-decrypt]');
  if (hero) decrypt(hero, 700);
  initReveals();
}
