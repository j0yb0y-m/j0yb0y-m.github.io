// ========== TYPEWRITER ==========
const typewriterEl = document.getElementById('typewriter');
const phrases = [
  'cat /etc/passwd  # just kidding',
  'nmap -sV -sC target',
  'hydra -l admin -P rockyou.txt ssh://target',
  'python3 exploit.py --target 10.0.0.1',
  'Hello, World! (in assembly)',
  'j0yb0y@site:~$ whoami',
];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let currentText = '';

function typeEffect() {
  const currentPhrase = phrases[phraseIdx];
  const speed = isDeleting ? 30 : 80;
  if (!isDeleting) {
    currentText = currentPhrase.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === currentPhrase.length) {
      typewriterEl.textContent = currentText;
      isDeleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    currentText = currentPhrase.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeEffect, 500);
      return;
    }
  }
  typewriterEl.textContent = currentText;
  setTimeout(typeEffect, speed);
}
typeEffect();

// ========== MATRIX RAIN ==========
const canvas = document.createElement('canvas');
const matrixContainer = document.getElementById('matrix-canvas');
if (matrixContainer) {
  canvas.style.display = 'block';
  matrixContainer.appendChild(canvas);
}
const ctx = canvas.getContext('2d');
let matrixDrops = [];

function initMatrix() {
  const container = document.getElementById('matrix-canvas');
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  matrixDrops = Array(columns).fill(1);
}

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]|&^%$#@!';

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = '14px monospace';
  for (let i = 0; i < matrixDrops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * 14, matrixDrops[i] * 14);
    if (matrixDrops[i] * 14 > canvas.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i]++;
  }
}

let matrixInterval;
function startMatrix() {
  initMatrix();
  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = setInterval(drawMatrix, 50);
}
function stopMatrix() {
  if (matrixInterval) { clearInterval(matrixInterval); matrixInterval = null; }
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  startMatrix();
  window.addEventListener('resize', initMatrix);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopMatrix() : startMatrix();
  });
}

// ========== SKILL BAR OBSERVER ==========
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'none';
        void entry.target.offsetHeight;
        entry.target.style.animation = '';
      }
    });
  },
  { threshold: 0.3 }
);
skillFills.forEach((el) => skillObserver.observe(el));

// ========== NAV HIGHLIGHT ==========
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--green)' : '';
      });
    }
  });
}, { rootMargin: '-120px 0px -70% 0px', threshold: 0 });

sections.forEach(section => navObserver.observe(section));

// ========== CONSOLE EASTER EGG ==========
console.log('%c j0yb0y ', 'background: #00ff41; color: #000; font-size: 1.2rem; font-weight: bold; padding: 4px 8px;');
console.log('%c Welcome to my terminal. Feel free to look around. ', 'color: #00ff41; font-size: 0.8rem;');
console.log('%c >_ "The quieter you become, the more you can hear." ', 'color: #666; font-size: 0.75rem; font-style: italic;');

// ========== DYNAMIC PROJECTS ==========
const LANGUAGE_COLORS = {
  Python: '#3572A5', JavaScript: '#f1e05a', Go: '#00ADD8',
  C: '#555555', 'C++': '#f34b7d', HTML: '#e34c26',
  CSS: '#563d7c', Shell: '#89e051', Rust: '#dea584',
  TypeScript: '#3178c6', Java: '#b07219', Ruby: '#701516'
};

async function loadProjects() {
  const grid = document.getElementById('project-grid');
  const filterContainer = document.getElementById('project-filter-buttons');
  const sortContainer = document.getElementById('project-sort');
  if (!grid) return;

  let allRepos = [];
  let currentFilter = 'All';
  let currentSort = 'updated';

  function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card revealed';
    card.dataset.language = repo.language || '';

    const langColor = LANGUAGE_COLORS[repo.language] || '#888';
    const topicsHtml = (repo.topics || []).slice(0, 4)
      .map(t => `<span class="tag">${t}</span>`).join('');

    card.innerHTML = `
      <div class="project-header">
        <span class="project-icon">&gt;_</span>
        <h3>${repo.name}</h3>
      </div>
      <p>${repo.description || 'No description available.'}</p>
      <div class="project-tags">${topicsHtml}</div>
      <div class="project-stats">
        ${repo.language ? `<span class="stat"><span class="lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
        <span class="stat">&#9733; ${repo.stargazers_count}</span>
        <span class="stat">&#9912; ${repo.forks_count}</span>
        <span class="stat dim">${timeAgo(repo.updated_at)}</span>
      </div>
      <div class="project-links">
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="btn-small" aria-label="View ${repo.name} on GitHub">[source]</a>
      </div>
    `;
    return card;
  }

  function renderProjects() {
    let filtered = currentFilter === 'All'
      ? allRepos
      : allRepos.filter(r => r.language === currentFilter);

    if (currentSort === 'stars') {
      filtered = [...filtered].sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (currentSort === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = '<p class="section-footer">No projects match this filter.</p>';
      return;
    }
    filtered.forEach(repo => grid.appendChild(createProjectCard(repo)));
  }

  function renderFilters() {
    const languages = ['All', ...new Set(allRepos.map(r => r.language).filter(Boolean))];
    filterContainer.innerHTML = '';
    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = `filter-btn${lang === currentFilter ? ' active' : ''}`;
      btn.textContent = lang;
      btn.setAttribute('aria-label', `Filter by ${lang}`);
      btn.addEventListener('click', () => {
        currentFilter = lang;
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjects();
      });
      filterContainer.appendChild(btn);
    });

    sortContainer.innerHTML = '';
    ['updated', 'stars', 'name'].forEach(sort => {
      const btn = document.createElement('button');
      btn.className = `sort-btn${sort === currentSort ? ' active' : ''}`;
      btn.textContent = sort;
      btn.setAttribute('aria-label', `Sort by ${sort}`);
      btn.addEventListener('click', () => {
        currentSort = sort;
        sortContainer.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjects();
      });
      sortContainer.appendChild(btn);
    });
  }

  try {
    allRepos = await GitHubAPI.fetchRepos();
    renderFilters();
    renderProjects();

    const searchItems = allRepos.map(r => ({
      label: r.name,
      command: `cd ~/projects/${r.name}`,
      url: r.html_url
    }));
    UI.addDynamicSearchItems(searchItems);
  } catch (err) {
    grid.innerHTML = `
      <div class="project-card error-card">
        <p>Failed to load repositories.</p>
        <a href="https://github.com/j0yb0y-m?tab=repositories" target="_blank" rel="noopener" class="btn-small">[view on github]</a>
      </div>`;
  }
}

// ========== DYNAMIC BLOG ==========
async function loadBlog() {
  const grid = document.getElementById('blog-grid');
  const searchInput = document.getElementById('blog-search');
  if (!grid) return;

  try {
    await Blog.loadPosts(grid, 3);
    if (searchInput) Blog.initSearch(searchInput, grid);

    const blogCards = grid.querySelectorAll('.blog-card');
    const blogItems = Array.from(blogCards).map(card => ({
      label: card.querySelector('.blog-title')?.textContent || '',
      command: `cat ~/blog/${card.querySelector('.read-more')?.getAttribute('href')?.split('/').pop()?.replace('.html', '') || ''}`,
      url: card.querySelector('.read-more')?.getAttribute('href') || '#'
    }));
    UI.addDynamicSearchItems(blogItems);
  } catch {
    grid.innerHTML = '<p class="section-footer">Failed to load blog posts.</p>';
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  UI.initProgressBar();
  UI.initMobileMenu();
  UI.initBackToTop();
  UI.initScrollReveal();
  loadProjects();
  loadBlog().then(() => {
    UI.initCommandPalette();
  });
});
