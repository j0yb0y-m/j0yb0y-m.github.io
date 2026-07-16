#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node new-post.js "Post Title"');
  process.exit(1);
}

const title = args.join(' ');
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const date = new Date().toISOString().split('T')[0];

const template = `---
title: ${title}
date: ${date}
description: A short description of the post.
tags: tag1, tag2
readtime: 5
---

# ${title}

Start writing your content here...
`;

const filePath = path.join(__dirname, 'blog', 'posts', `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`Error: Post ${slug}.md already exists!`);
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`Success! Created new post at: blog/posts/${slug}.md`);
