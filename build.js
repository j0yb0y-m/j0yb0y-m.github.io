#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'blog', 'posts');
const TEMPLATE_PATH = path.join(POSTS_DIR, 'post-template.html');
const BASE_URL = 'https://j0yb0y-m.github.io';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.substring(0, idx).trim();
    const value = line.substring(idx + 1).trim();
    meta[key] = key === 'tags' ? value.split(',').map(t => t.trim()).filter(Boolean) : value;
  });
  return { meta, body: match[2] };
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightSyntax(code, lang) {
  if (!lang) return escapeHtml(code);
  const l = lang.toLowerCase();
  const LANGS = {
    python: {
      keywords: new Set('def class return if elif else for while import from as try except finally with raise pass break continue yield lambda and or not in is None True False global nonlocal assert del print self'.split(' ')),
      builtins: new Set('range len int str float list dict set tuple bool type super open input map filter zip enumerate sorted reversed abs min max sum any all hasattr getattr setattr isinstance issubclass'.split(' '))
    },
    go: {
      keywords: new Set('func package import var const type struct interface map chan return if else for range switch case default break continue go defer select fallthrough nil true false make new append len cap copy close delete panic recover'.split(' ')),
      builtins: new Set('fmt.Println Printf Sprintf Errorf log net http sync os io ioutil strings strconv time context errors'.split(' '))
    },
    javascript: {
      keywords: new Set('function return if else for while do switch case default break continue new var let const class extends import export from async await try catch finally throw typeof instanceof void delete in of yield this super true false null undefined'.split(' ')),
      builtins: new Set('console document window Math JSON Array Object String Number Boolean Promise Date RegExp Map Set Error parseInt parseFloat setTimeout setInterval fetch require module exports'.split(' '))
    },
    bash: {
      keywords: new Set('if then else elif fi for while do done case esac function return in local export source alias unset readonly shift exit exec eval trap set'.split(' ')),
      builtins: new Set('echo cd ls cat grep sed awk find mkdir rm cp mv chmod chown sudo apt yum dnf pacman brew curl wget ssh scp tar git docker npm node python python3 pip pip3 make gcc go rustc cargo'.split(' '))
    }
  };
  const cfg = LANGS[l] || LANGS[(l === 'sh' || l === 'shell' || l === 'zsh') ? 'bash' : (l === 'js' || l === 'ts' || l === 'typescript' ? 'javascript' : (l === 'py' ? 'python' : null))];
  if (!cfg) return escapeHtml(code);
  const commentPrefix = l === 'bash' || l === 'sh' || l === 'shell' || l === 'zsh' ? '#' : '//';
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === '\\') j++; j++; }
      tokens.push({ t: 'str', v: code.slice(i, Math.min(j + 1, code.length)) });
      i = j + 1;
    } else if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") j++;
      tokens.push({ t: 'str', v: code.slice(i, Math.min(j + 1, code.length)) });
      i = j + 1;
    } else if (code[i] === '`' && (l === 'javascript' || l === 'js' || l === 'ts' || l === 'typescript')) {
      let j = i + 1;
      while (j < code.length && code[j] !== '`') { if (code[j] === '\\') j++; j++; }
      tokens.push({ t: 'str', v: code.slice(i, Math.min(j + 1, code.length)) });
      i = j + 1;
    } else if (code.substring(i, i + commentPrefix.length) === commentPrefix) {
      let j = code.indexOf('\n', i);
      if (j === -1) j = code.length;
      tokens.push({ t: 'cmt', v: code.slice(i, j) });
      i = j;
    } else if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9.xXa-fA-F]/.test(code[j])) j++;
      tokens.push({ t: 'num', v: code.slice(i, j) });
      i = j;
    } else if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const w = code.slice(i, j);
      tokens.push({ t: cfg.keywords.has(w) ? 'kw' : cfg.builtins.has(w) ? 'bi' : 'txt', v: w });
      i = j;
    } else {
      tokens.push({ t: 'txt', v: code[i] });
      i++;
    }
  }
  return tokens.map(tk => {
    const v = escapeHtml(tk.v);
    switch (tk.t) {
      case 'kw': return `<span class="hl-kw">${v}</span>`;
      case 'bi': return `<span class="hl-bi">${v}</span>`;
      case 'str': return `<span class="hl-str">${v}</span>`;
      case 'cmt': return `<span class="hl-cmt">${v}</span>`;
      case 'num': return `<span class="hl-num">${v}</span>`;
      default: return v;
    }
  }).join('');
}

function markdownToHtml(md) {
  const codeBlocks = [];
  let text = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push({ lang: lang || '', code: code.replace(/\n$/, '') });
    return `\x00CB${codeBlocks.length - 1}\x00`;
  });
  const inlineCodes = [];
  text = text.replace(/`([^`\n]+)`/g, (_, code) => {
    inlineCodes.push(code);
    return `\x00IC${inlineCodes.length - 1}\x00`;
  });
  text = escapeHtml(text);
  text = text.replace(/\x00IC(\d+)\x00/g, (_, i) => `<code>${escapeHtml(inlineCodes[+i])}</code>`);
  text = text.replace(/^\#{1,6}\s+(.+)$/gm, (_, c) => `<h3>${c}</h3>`);
  text = text.replace(/^\>\s*(.+)$/gm, '<blockquote><p>$1</p></blockquote>');
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  const lines = text.split('\n');
  let html = '', inUl = false, inOl = false, para = [];
  const flushPara = () => { if (para.length) { html += `<p>${para.join(' ')}</p>\n`; para = []; } };
  const closeLists = () => { if (inUl) { html += '</ul>\n'; inUl = false; } if (inOl) { html += '</ol>\n'; inOl = false; } };
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('\x00CB')) { flushPara(); closeLists(); html += trimmed + '\n'; continue; }
    if (trimmed === '') { flushPara(); closeLists(); continue; }
    if (trimmed.startsWith('<h3>') || trimmed.startsWith('<blockquote>') || trimmed.startsWith('<img')) { flushPara(); closeLists(); html += trimmed + '\n'; continue; }
    let m;
    if ((m = trimmed.match(/^[-*]\s+(.+)$/))) { flushPara(); if (inOl) { html += '</ol>\n'; inOl = false; } if (!inUl) { html += '<ul>\n'; inUl = true; } html += `<li>${m[1]}</li>\n`; continue; }
    if ((m = trimmed.match(/^\d+\.\s+(.+)$/))) { flushPara(); if (inUl) { html += '</ul>\n'; inUl = false; } if (!inOl) { html += '<ol>\n'; inOl = true; } html += `<li>${m[1]}</li>\n`; continue; }
    closeLists();
    para.push(trimmed);
  }
  flushPara();
  closeLists();
  html = html.replace(/\x00CB(\d+)\x00/g, (_, i) => {
    const b = codeBlocks[+i];
    const cls = b.lang ? ` class="language-${b.lang}"` : '';
    return `<pre><code${cls}>${highlightSyntax(b.code, b.lang)}</code></pre>`;
  });
  return html;
}

function build() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const mdFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  if (!mdFiles.length) { console.log('No .md files found in blog/posts/'); return; }
  const posts = [];
  for (const file of mdFiles) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const slug = path.basename(file, '.md');
    const content = markdownToHtml(body);
    const tags = Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []);
    let postHtml = template
      .replace(/\{\{title\}\}/g, meta.title || slug)
      .replace(/\{\{slug\}\}/g, slug)
      .replace(/\{\{date\}\}/g, meta.date || '')
      .replace(/\{\{readtime\}\}/g, meta.readtime || '0')
      .replace(/\{\{description\}\}/g, meta.description || '')
      .replace(/\{\{tags\}\}/g, tags.join(', '))
      .replace(/\{\{content\}\}/g, content);
    fs.writeFileSync(path.join(POSTS_DIR, `${slug}.html`), postHtml);
    posts.push({ title: meta.title || slug, date: meta.date || '', readtime: parseInt(meta.readtime) || 0, description: meta.description || '', tags, filename: `${slug}.html` });
    console.log(`  Built: ${slug}.html`);
  }
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(path.join(POSTS_DIR, 'posts.json'), JSON.stringify(posts, null, 2));
  console.log('  Generated: posts.json');
  const now = new Date().toISOString();
  const urls = [
    { loc: '/', priority: '1.0', freq: 'weekly' },
    { loc: '/blog/', priority: '0.8', freq: 'weekly' },
    ...posts.map(p => ({ loc: `/blog/posts/${p.filename}`, priority: '0.6', freq: 'monthly' }))
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${now.split('T')[0]}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
  console.log('  Generated: sitemap.xml');
  console.log(`\nDone! Built ${posts.length} post(s).`);
}

console.log('Building blog posts...\n');
build();
