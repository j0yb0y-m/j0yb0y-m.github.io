const UI = (() => {
  function initProgressBar() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }
    window.addEventListener('scroll', () => requestAnimationFrame(update));
    update();
  }

  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          const children = entry.target.querySelectorAll('.project-card, .blog-card, .skill-category');
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 50}ms`;
            child.classList.add('revealed');
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
  }

  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('mobile-menu-overlay');
    if (!toggle || !overlay) return;
    const links = overlay.querySelectorAll('a');

    function closeMenu() {
      overlay.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '[=]';
    }

    toggle.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '[x]' : '[=]';
    });

    links.forEach(link => link.addEventListener('click', closeMenu));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMenu();
    });
  }

  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function buildSearchIndex() {
    const items = [];
    document.querySelectorAll('section[id]').forEach(section => {
      const id = section.id;
      const title = section.querySelector('.section-title')?.textContent?.replace(/[#~]/g, '').trim() || id;
      items.push({ label: title, command: `cd ~/${id}`, url: `#${id}` });
    });
    return items;
  }

  function addDynamicSearchItems(items) {
    searchIndex.push(...items);
  }

  let searchIndex = [];

  function fuzzyMatch(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    if (text.includes(query)) return true;
    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  function initCommandPalette(dynamicItems = []) {
    searchIndex = [...buildSearchIndex(), ...dynamicItems];
    const overlay = document.getElementById('command-palette');
    const input = document.getElementById('command-input');
    const results = document.getElementById('command-results');
    if (!overlay || !input || !results) return;

    let selectedIdx = 0;

    function open() {
      overlay.classList.add('active');
      input.value = '';
      input.focus();
      renderResults('');
    }

    function close() {
      overlay.classList.remove('active');
    }

    function renderResults(query) {
      const filtered = query
        ? searchIndex.filter(item => fuzzyMatch(query, item.label) || fuzzyMatch(query, item.command))
        : searchIndex;
      results.innerHTML = '';
      filtered.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = `command-result${i === selectedIdx ? ' selected' : ''}`;
        div.textContent = item.command;
        div.addEventListener('click', () => {
          close();
          if (item.url.startsWith('#')) {
            document.querySelector(item.url)?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = item.url;
          }
        });
        results.appendChild(div);
      });
      selectedIdx = 0;
    }

    function updateSelection() {
      const items = results.querySelectorAll('.command-result');
      items.forEach((el, i) => el.classList.toggle('selected', i === selectedIdx));
    }

    input.addEventListener('input', () => renderResults(input.value));

    input.addEventListener('keydown', (e) => {
      const items = results.querySelectorAll('.command-result');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
        updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = Math.max(selectedIdx - 1, 0);
        updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[selectedIdx]?.click();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        overlay.classList.contains('active') ? close() : open();
      }
    });
  }

  return {
    initCommandPalette,
    initScrollReveal,
    initProgressBar,
    initMobileMenu,
    initBackToTop,
    buildSearchIndex,
    addDynamicSearchItems
  };
})();
