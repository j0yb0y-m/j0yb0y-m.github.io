const Blog = (() => {
  const POST_META_CACHE_KEY = 'blog_post_meta';
  const POST_META_TTL = 24 * 60 * 60 * 1000;

  function parsePostMeta(htmlContent) {
    const match = htmlContent.match(/<!-- POST_META\n([\s\S]*?)-->/);
    if (!match) return null;
    const lines = match[1].trim().split('\n');
    const meta = {};
    lines.forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      const key = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      meta[key] = key === 'tags' ? value.split(',').map(t => t.trim()) : value;
    });
    return {
      title: meta.title || 'Untitled',
      date: meta.date || '',
      readtime: parseInt(meta.readtime) || 0,
      description: meta.description || '',
      tags: meta.tags || []
    };
  }

  function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  function createBlogCard(post, filename) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.dataset.tags = (post.tags || []).join(',');
    card.dataset.title = (post.title || '').toLowerCase();
    card.dataset.description = (post.description || '').toLowerCase();

    const tagsHtml = (post.tags || [])
      .map(t => `<span class="tag blog-tag" data-tag="${t}">[${t}]</span>`)
      .join(' ');

    card.innerHTML = `
      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-meta">${post.date}${post.readtime ? ` &middot; ${post.readtime} min read` : ''}</p>
      <p>${post.description}</p>
      <div class="blog-tags">${tagsHtml}</div>
      <a href="blog/posts/${filename}" class="read-more">[read more]</a>
    `;
    return card;
  }

  async function loadPosts(containerEl, limit = 0) {
    const cachedMeta = GitHubAPI.getCache(POST_META_CACHE_KEY);
    let posts = [];

    if (cachedMeta) {
      posts = cachedMeta;
    } else {
      try {
        const files = await GitHubAPI.fetchBlogFiles();
        const fetchPromises = files.map(async (file) => {
          const res = await fetch(file.download_url);
          const html = await res.text();
          const meta = parsePostMeta(html);
          return meta ? { ...meta, filename: file.name } : null;
        });
        const results = await Promise.all(fetchPromises);
        posts = results.filter(Boolean);
        GitHubAPI.setCache(POST_META_CACHE_KEY, posts, POST_META_TTL);
      } catch (err) {
        containerEl.innerHTML = '<p class="section-footer">Failed to load blog posts. <a href="blog/index.html">View all posts</a></p>';
        return;
      }
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayPosts = limit > 0 ? posts.slice(0, limit) : posts;

    containerEl.innerHTML = '';
    displayPosts.forEach(post => {
      containerEl.appendChild(createBlogCard(post, post.filename));
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

  return { loadPosts, parsePostMeta, initSearch };
})();
