# selfperson

Personal website for [kpmckay.io](https://kpmckay.io). Built with Astro, Tailwind CSS, and deployed to GitHub Pages.

<p align="right">
<br>
<b>"I run my own and I'm my own self person"</b><br>
<sub>Playaz Club by Rappin' 4-Tay</sub>
</p>

---

## Project structure

```
web/
├── src/
│   ├── components/        # Layout, Sidebar, FeedEntry, Lightbox
│   ├── content/
│   │   ├── feed/          # Activity feed entries (Markdown)
│   │   └── articles/      # Long-form articles (Markdown, with co-located images)
│   ├── pages/
│   │   ├── index.astro    # Home page (activity feed)
│   │   ├── articles/      # Article pages (dynamic route)
│   │   └── rss.xml.js     # RSS feed
│   ├── styles/
│   │   └── global.css
│   └── config.ts          # Site-wide config (name, bio, social links)
├── editor/                # Feed entry editor (localhost:3001)
├── articles-editor/       # Article editor (localhost:3002)
├── scripts/
│   └── new-article.mjs    # CLI scaffold for new articles
└── public/                # Static assets (profile photo, favicon, images)
```

## Development

```bash
cd web
npm install
npm run dev        # http://localhost:4321
```

## Content

### Feed entries

Short updates that appear on the home page. Each entry is a Markdown file in `src/content/feed/` with YAML frontmatter.

**Using the editor (recommended):**

```bash
cd web/editor
npm install        # first time only
npm start          # http://localhost:3001
```

**Manually:** create `src/content/feed/MM-DD-YYYY-slug.md`:

```markdown
---
date: 2026-03-26
title: "Entry title"
summary: "Text shown on the feed. Supports **bold**, *italic*, [links](url)."
tag: "Optional tag"
link: "https://optional-external-link"
linkText: "Link label"
images:
  - /images/photo.jpg
---
```

### Articles

Long-form posts with full Markdown bodies and co-located images. Each article lives in its own directory under `src/content/articles/`.

```
src/content/articles/
└── 2026-03-26-my-article/
    ├── index.md
    └── images/
        └── photo.jpg
```

**Using the editor (recommended):**

```bash
cd web/articles-editor
npm install        # first time only
npm start          # http://localhost:3002
```

Click **Insert Image** in the toolbar to upload a photo and drop it at the cursor. Type the caption between `[` and `]` — it appears as a caption beneath the image on the published page. Consecutive images sit side-by-side automatically.

**Using the CLI scaffold:**

```bash
cd web
npm run new-article -- "Article Title"
```

Creates the directory structure and opens a template `index.md` ready to edit.

**Frontmatter fields:**

```markdown
---
date: 2026-03-26
title: "Article title"
description: "One-line description used for page meta."
tag: "Optional tag"
---

Article body in full Markdown. Images are embedded inline:

![Caption text](./images/photo.jpg)
```

Articles are published at `/articles/YYYY-MM-DD-slug` and can be linked from feed entries using the `link` field.

## Build & deploy

```bash
cd web
npm run build      # outputs to web/dist/
```

Pushes to `main` or `master` automatically deploy to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). The live site is at [kpmckay.io](https://kpmckay.io).
