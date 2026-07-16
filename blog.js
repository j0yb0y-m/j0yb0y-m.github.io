const Blog = (() => {
  function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  function createBlogCard(post, basePath) {
    const card = document.createElement('article');
    card.className = 'blog-card revealed';
    card.dataset.tags = (post.tags || []).join(',');
    card.dataset.title = (post.title || '').toLowerCase();
    card.dataset.description = (post.description || '').toLowerCase();

    const tagsHtml = (post.tags || [])
      .map(t => `<span class="tag blog-tag" data-tag="${t}">[${t}]</span>`)
      .join(' ');

    card.innerHTML = `
      <div class="window-controls">
        <div class="window-dot close"></div>
        <div class="window-dot minimize"></div>
        <div class="window-dot maximize"></div>
      </div>
      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-meta">${post.date}${post.readtime ? ` &middot; ${post.readtime} min read` : ''}</p>
      <p>${post.description}</p>
      <div class="blog-tags">${tagsHtml}</div>
      <a href="${basePath}${post.filename}" class="read-more">[read more]</a>
    `;
    return card;
  }

  async function loadPosts(containerEl, limit = 0) {
    const postsPath = window.location.pathname.includes('/blog/posts/') ? 'posts.json' : window.location.pathname.includes('/blog/') ? 'posts/posts.json' : 'blog/posts/posts.json';
    let posts;
    try {
      const res = await fetch(postsPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      posts = await res.json();
    } catch {
      containerEl.innerHTML = '<p class="section-footer">Failed to load blog posts.</p>';
      return;
    }

    let basePath = 'blog/posts/';
    if (window.location.pathname.includes('/blog/posts/')) {
      basePath = '';
    } else if (window.location.pathname.includes('/blog/')) {
      basePath = 'posts/';
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayPosts = limit > 0 ? posts.slice(0, limit) : posts;

    containerEl.innerHTML = '';
    displayPosts.forEach(post => {
      containerEl.appendChild(createBlogCard(post, basePath));
    });

    containerEl.querySelectorAll('.blog-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        const searchInput = document.querySelector('.blog-search-input');
        if (searchInput) {
          searchInput.value = e.target.dataset.tag;
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  function initSearch(inputEl, containerEl) {
    let debounceTimer;
    inputEl.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = inputEl.value.toLowerCase().trim();
        const cards = containerEl.querySelectorAll('.blog-card');
        cards.forEach(card => {
          const title = card.dataset.title || '';
          const desc = card.dataset.description || '';
          const tags = card.dataset.tags || '';
          const match = !query || title.includes(query) || desc.includes(query) || tags.includes(query);
          card.style.display = match ? '' : 'none';
        });
      }, 200);
    });
  }

  return { loadPosts, initSearch };
})();
