#!/usr/bin/env node
/**
 * Scaffold a new article with co-located images directory.
 *
 * Usage:
 *   npm run new-article -- "My Article Title"
 *
 * Creates:
 *   src/content/articles/YYYY-MM-DD-my-article-title/
 *   ├── index.md
 *   └── images/
 *       └── .gitkeep
 */

import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const articlesRoot = join(__dirname, '..', 'src', 'content', 'articles');

const title = process.argv[2];

if (!title) {
  console.error('Usage: npm run new-article -- "Article Title"');
  process.exit(1);
}

const today = new Date();
const date = today.toISOString().split('T')[0]; // YYYY-MM-DD

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const dirName = `${date}-${slug}`;
const articleDir = join(articlesRoot, dirName);
const imagesDir = join(articleDir, 'images');

await mkdir(imagesDir, { recursive: true });
await writeFile(join(imagesDir, '.gitkeep'), '');

const template = `---
date: ${date}
title: "${title}"
description: ""
---

Write your article here.

<!-- To embed an image, drop the file into ./images/ and reference it like:
     ![Alt text](./images/filename.jpg)
-->
`;

const indexPath = join(articleDir, 'index.md');
await writeFile(indexPath, template);

console.log(`\nArticle created at:\n  src/content/articles/${dirName}/index.md\n`);
console.log(`Drop images into:\n  src/content/articles/${dirName}/images/\n`);
console.log(`It will be available at:\n  /articles/${dirName}\n`);
