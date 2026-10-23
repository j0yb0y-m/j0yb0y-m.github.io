(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#yr').textContent = new Date().getFullYear();

  // Typing effect
  const lines = ['penetration tester', 'network & web security', 'python - go - bash - c & c++ - powershell', 'agentic AI workflows', 'always learning'];
  const out = $('#typed');
  if (reduce) out.textContent = lines[0];
  else {
    let l = 0, c = 0, del = false;
    const tick = () => {
      const t = lines[l];
      out.textContent = t.slice(0, c);
      if (!del && c === t.length) { del = true; return setTimeout(tick, 1600); }
      if (del && c === 0) { del = false; l = (l + 1) % lines.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 70);
    };
    tick();
  }

  // Scroll reveal
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Project gallery from projects.json (built with textContent only — no HTML injection)
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const card = (p) => {
    const a = el('a', 'proj'); a.href = p.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.append(el('h4', '', p.name), el('p', '', p.description), el('div', 'tags', (p.tags || []).join(' · ')), el('div', 'go', 'view repo →'));
    return a;
  };
  fetch('projects.jsonc').then((r) => r.json()).then((list) => {
    const g = $('#gallery'); g.replaceChildren();
    const track = el('div', 'track');
    list.forEach((p) => track.append(card(p)));
    if (!reduce) {
      list.forEach((p) => { const c = card(p); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.append(c); });
      track.style.setProperty('--dur', Math.max(20, list.length * 8) + 's');
    }
    g.append(track);
  }).catch(() => { $('#gallery').firstElementChild.textContent = 'Could not load projects.json (serve the site over http, not file://).'; });

  // Click-to-copy (Discord)
  document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    const note = b.querySelector('em');
    navigator.clipboard.writeText(b.dataset.copy).then(() => {
      note.textContent = '(copied!)'; setTimeout(() => (note.textContent = '(click to copy)'), 1800);
    });
  }));
})();
