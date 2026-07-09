const GitHubAPI = (() => {
  const REPO_CACHE_KEY = 'gh_repos';
  const BLOG_CACHE_KEY = 'blog_posts';
  const REPO_TTL = 60 * 60 * 1000;
  const BLOG_TTL = 24 * 60 * 60 * 1000;
  const USERNAME = 'j0yb0y-m';
  const REPO_NAME = 'j0yb0y-m.github.io';

  function getCache(key) {
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (!cached) return null;
      const now = Date.now();
      if (now - cached.timestamp > cached.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return cached.data;
    } catch {
      return null;
    }
  }

  function setCache(key, data, ttlMs) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      }));
    } catch {}
  }

  async function fetchRepos() {
    const cached = getCache(REPO_CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100&type=owner`
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const repos = await res.json();
    const filtered = repos
      .filter(r => !r.fork)
      .map(r => ({
        name: r.name,
        description: r.description || '',
        html_url: r.html_url,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
        topics: r.topics || [],
        fork: r.fork
      }));

    setCache(REPO_CACHE_KEY, filtered, REPO_TTL);
    return filtered;
  }

  async function fetchBlogFiles() {
    const cached = getCache(BLOG_CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(
      `https://api.github.com/repos/${USERNAME}/${REPO_NAME}/contents/blog/posts`
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const files = await res.json();
    const htmlFiles = files
      .filter(f => f.name.endsWith('.html'))
      .map(f => ({
        name: f.name,
        download_url: f.download_url,
        path: f.path
      }));

    setCache(BLOG_CACHE_KEY, htmlFiles, BLOG_TTL);
    return htmlFiles;
  }

  return { fetchRepos, fetchBlogFiles, getCache, setCache };
})();
