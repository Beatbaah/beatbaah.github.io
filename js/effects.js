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
  let i = 0, paused = false;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (count) count.textContent = `${i + 1} / ${slides.length}`;
  };
  root.classList.add('is-enhanced');
  root.querySelector('.carousel-controls').hidden = false;
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-dir]');
    if (b) show(i + (b.dataset.dir === 'next' ? 1 : -1));
  });
  ['pointerenter', 'focusin'].forEach(t => root.addEventListener(t, () => { paused = true; }));
  ['pointerleave', 'focusout'].forEach(t => root.addEventListener(t, () => { paused = false; }));
  show(0);
  if (!reducedMotion) setInterval(() => { if (!paused && !document.hidden) show(i + 1); }, 6000);
}

export function initEffects({ reducedMotion }) {
  initProgress();
  initSpotlight();
  initCarousel(reducedMotion);
  if (reducedMotion) return; // content stays fully visible; no scramble, no slide-in
  document.documentElement.classList.add('fx');
  const hero = document.querySelector('h1 [data-decrypt]');
  if (hero) decrypt(hero, 700);
  initReveals();
}
