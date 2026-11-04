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

/** Hero terminal and featured cards tilt toward the cursor (mouse only). */
function initTilt() {
  if (!finePointer()) return;
  const hero = document.getElementById('hero'), term = hero?.querySelector('.terminal-3d');
  if (term) {
    hero.addEventListener('pointermove', (e) => {
      const r = term.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
      const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
      term.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`;
    });
    hero.addEventListener('pointerleave', () => { term.style.transform = ''; });
  }
  document.querySelectorAll('.work-grid .card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.transform = `rotateX(${-y * 7}deg) rotateY(${x * 9}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.classList.remove('is-tilting'); card.style.transform = ''; });
  });
}

/** Dot globe with Ghana pinned and arcs out to the world. Drag to spin; runs only while on screen. */
function initGlobe(reducedMotion) {
  const slot = document.querySelector('#contact .globe-slot');
  if (!slot) return;
  slot.hidden = false;
  const cv = document.createElement('canvas');
  cv.dataset.running = 'false';
  slot.append(cv);
  const ctx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
  const size = () => { cv.width = slot.clientWidth * dpr; cv.height = slot.clientHeight * dpr; };
  size();
  const ll = (lat, lon) => { const a = lat * Math.PI / 180, b = -lon * Math.PI / 180; return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)]; };
  const rot = ([x, y, z], ax, ay) => {
    let c = Math.cos(ay), s = Math.sin(ay); [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(ax); s = Math.sin(ax); return [x, y * c - z * s, y * s + z * c];
  };
  const arc = (a, b, t) => { const p = a.map((v, i) => v * (1 - t) + b[i] * t), m = Math.hypot(...p), h = 1 + Math.sin(Math.PI * t) * 0.3; return p.map(v => v / m * h); };
  const dots = Array.from({ length: 1400 }, (_, i) => { const y = 1 - 2 * (i + 0.5) / 1400, r = Math.sqrt(1 - y * y), th = i * 2.39996; return [Math.cos(th) * r, y, Math.sin(th) * r]; });
  const home = ll(7.9, -1.0), dests = [ll(51.5, -0.1), ll(40.7, -74), ll(52.5, 13.4), ll(6.5, 3.4), ll(-1.3, 36.8), ll(25.2, 55.3)];
  let ay = -2.2, ax = 0.2, steer = 0, raf = 0, on = false;
  const draw = (t) => {
    const W = cv.width, H = cv.height, wide = W > 900 * dpr;
    const R = wide ? Math.min(W * 0.36, H * 0.62) : W * 0.62, cx = wide ? W * 0.74 : W * 0.6, cy = wide ? H * 0.36 : H * 0.2;
    const P = (p) => { const [x, y, z] = rot(p, ax, ay); return [cx + x * R, cy - y * R, z]; };
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) { const [x, y, z] = P(d); if (z > -0.05) { ctx.fillStyle = `rgba(255,255,255,${0.05 + z * 0.22})`; ctx.fillRect(x, y, 1.6 * dpr, 1.6 * dpr); } }
    ctx.lineWidth = dpr;
    dests.forEach((d, k) => {
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= 32; i++) { const [x, y, z] = P(arc(home, d, i / 32)); if (z < 0) { pen = false; continue; } pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; }
      ctx.strokeStyle = wide ? 'rgba(198,243,107,.35)' : 'rgba(198,243,107,.18)'; ctx.stroke();
      const [x, y, z] = P(arc(home, d, (t / 2400 + k / dests.length) % 1));
      if (z > 0) { ctx.fillStyle = '#c6f36b'; ctx.beginPath(); ctx.arc(x, y, 2.3 * dpr, 0, 7); ctx.fill(); }
    });
    const [gx, gy, gz] = P(home);
    if (gz > 0) {
      const pulse = (t / 1000) % 1;
      ctx.strokeStyle = `rgba(198,243,107,${1 - pulse})`; ctx.beginPath(); ctx.arc(gx, gy, (3 + pulse * 14) * dpr, 0, 7); ctx.stroke();
      ctx.fillStyle = '#c6f36b'; ctx.beginPath(); ctx.arc(gx, gy, 3.5 * dpr, 0, 7); ctx.fill();
    }
  };
  const loop = (t) => {
    raf = 0;
    if (!on) return;
    ay += 0.0016 + steer * 0.006;
    draw(t);
    raf = requestAnimationFrame(loop);
  };
  draw(0);
  addEventListener('resize', () => { size(); draw(performance.now()); });
  if (reducedMotion) return;
  // background: steer gently toward the cursor while it moves over the panel
  const panel = slot.parentElement;
  panel.addEventListener('pointermove', (e) => {
    const r = panel.getBoundingClientRect();
    steer = ((e.clientX - r.left) / r.width - 0.5) * 2;
    cv.dataset.steer = steer.toFixed(2);
  });
  panel.addEventListener('pointerleave', () => { steer = 0; cv.dataset.steer = '0'; });
  new IntersectionObserver(([en]) => {
    on = en.isIntersecting; cv.dataset.running = String(on);
    if (on && !raf) raf = requestAnimationFrame(loop);
  }).observe(cv);
}

export function initEffects({ reducedMotion }) {
  initProgress();
  initSpotlight();
  initGlobe(reducedMotion);
  if (reducedMotion) return; // content stays fully visible; no scramble, no slide-in, no live effects
  document.documentElement.classList.add('fx');
  initMagnetic();
  initLiveGrid();
  initScanner();
  initCredentials();
  initTilt();
  const hero = document.querySelector('h1 [data-decrypt]');
  if (hero) decrypt(hero, 700);
  initReveals();
}
