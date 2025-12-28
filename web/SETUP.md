# Quick Setup Guide

Follow these steps to get your website up and running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Customize Your Site

### Update Site Configuration

Edit `src/config.ts`:
- Change `name` to your name
- Update `profile.bio` with your bio
- Add your social media links
- Add your publications

### Update Astro Configuration

Edit `astro.config.mjs`:
- Replace `USERNAME` with your GitHub username
- Replace `REPOSITORY` with your repository name
  - If using `username.github.io`, set `base: '/'`
  - If using a project repository, set `base: '/repository-name'`

### Add Your Assets

Add these files to the `public/` directory:
- `profile.jpg` - Your profile picture
- `resume.pdf` - Your resume
- (Optional) Replace `favicon.svg` with your own

## 3. Add Content

### Create Your First Feed Entry

Create `src/content/feed/2025-12-28-first-entry.md`:

```markdown
---
date: 2025-12-28
title: "My First Update"
summary: "Just launched my new personal website!"
link: "/blog/welcome"
type: "blog"
---
```

### Create Your First Blog Post

Create `src/content/blog/my-first-post.md`:

```markdown
---
title: "My First Blog Post"
description: "Welcome to my blog!"
date: 2025-12-28
tags: ["introduction"]
---

Content goes here...
```

## 4. Test Locally

```bash
npm run dev
```

Visit `http://localhost:4321` to see your site.

## 5. Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to **Settings** > **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to main/master branch to deploy

Your site will be live at `https://USERNAME.github.io/REPOSITORY/`

## Next Steps

- Remove or replace the example content in `src/content/feed/` and `src/content/blog/`
- Customize colors in `tailwind.config.mjs`
- Add more publications to `src/config.ts`
- Start adding your content!

For more details, see [README.md](./README.md)
