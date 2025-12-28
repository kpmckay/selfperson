# Personal Website

Edit: Keith was here!

A modern, professional personal website built with Astro, designed for GitHub Pages deployment. Features a chronological activity feed, blog, publications list, and professional profile.

## Features

- **Activity Feed**: Chronological feed of your latest updates, articles, and projects
- **Blog**: Full-featured blog with markdown support
- **Publications**: Manually curated list of publications
- **Profile**: About section with photo, bio, social links, and resume
- **Professional Design**: Clean, neutral color scheme with modern typography
- **Fully Responsive**: Works great on all devices
- **GitHub Pages Ready**: Automated deployment with GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:4321`

## Configuration

### Site Configuration

Edit `src/config.ts` to customize your site:

- **name**: Your name
- **profile.bio**: Your bio/about text
- **social**: Your social media links (LinkedIn, GitHub, Twitter, Email)
- **resume.url**: Path to your resume PDF
- **publications**: Array of your publications

### Astro Configuration

Edit `astro.config.mjs` to set your GitHub Pages URL:

- Replace `USERNAME` with your GitHub username
- Replace `REPOSITORY` with your repository name
- If using a custom domain or deploying to `username.github.io`, update the `base` setting accordingly

### Adding Your Assets

Place these files in the `public/` directory:

- `profile.jpg` - Your profile picture (recommended: square, at least 400x400px)
- `resume.pdf` - Your resume
- `favicon.svg` - Your favicon (optional)

## Adding Content

### Adding a Feed Entry

Create a new markdown file in `src/content/feed/` with the following format:

```markdown
---
date: 2025-12-28
title: "Your Entry Title"
summary: "A brief description of the entry"
link: "https://example.com/article" # or "/blog/post-slug" for internal blog posts
type: "external" # options: "blog", "external", "article", "project"
---
```

**Filename convention**: Use the format `YYYY-MM-DD-slug.md` (e.g., `2025-12-28-new-article.md`)

**Types**:
- `blog` - Internal blog post
- `external` - External article or link
- `article` - General article
- `project` - Project showcase

### Adding a Blog Post

Create a new markdown file in `src/content/blog/` with the following format:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description for the post listing and SEO"
date: 2025-12-28
tags: ["javascript", "tutorial"] # optional
draft: false # optional, set to true to hide
---

Your blog post content goes here in markdown format.

## Headings work

- So do
- Lists

And all other markdown features!
```

### Adding Publications

Edit the `publications` array in `src/config.ts`:

```typescript
publications: [
  {
    title: 'Your Publication Title',
    year: '2024',
    venue: 'Conference or Journal Name',
    url: 'https://example.com/publication',
  },
  // Add more...
]
```

## Deployment to GitHub Pages

### Initial Setup

1. Push your code to GitHub

2. Go to your repository settings on GitHub:
   - Navigate to **Settings** > **Pages**
   - Under **Source**, select **GitHub Actions**

3. The workflow will automatically run on every push to the main/master branch

4. Your site will be available at `https://USERNAME.github.io/REPOSITORY/`

### Subsequent Deployments

Simply push to your main/master branch:

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Actions will automatically build and deploy your site.

## Development Commands

| Command           | Action                                       |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start development server at `localhost:4321` |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview production build locally             |

## Project Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment workflow
├── public/
│   ├── profile.jpg           # Your profile picture
│   └── resume.pdf            # Your resume
├── src/
│   ├── components/
│   │   ├── Layout.astro      # Main layout wrapper
│   │   ├── Sidebar.astro     # Sidebar with profile and navigation
│   │   └── FeedEntry.astro   # Feed entry component
│   ├── content/
│   │   ├── feed/             # Feed entries (markdown)
│   │   ├── blog/             # Blog posts (markdown)
│   │   └── config.ts         # Content collections configuration
│   ├── pages/
│   │   ├── index.astro       # Home page with feed
│   │   └── blog/
│   │       ├── index.astro   # Blog listing
│   │       └── [slug].astro  # Individual blog post
│   ├── styles/
│   │   └── global.css        # Global styles
│   └── config.ts             # Site configuration
├── astro.config.mjs          # Astro configuration
├── package.json              # Dependencies
├── tailwind.config.mjs       # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Customization

### Colors

Edit `tailwind.config.mjs` to customize the color scheme. The default uses professional navy/slate blues:

```javascript
colors: {
  primary: {
    // ... color scale
  }
}
```

### Typography

The site uses the Inter font by default. To change it:

1. Update the Google Fonts link in `src/components/Layout.astro`
2. Update the font family in `tailwind.config.mjs`

### Layout

To change the sidebar width, edit the width classes in `src/components/Layout.astro`:

```astro
<aside class="lg:w-80 ...">  <!-- Change lg:w-80 -->
<main class="lg:ml-80 ...">  <!-- Change lg:ml-80 to match -->
```

## Support

For Astro-specific questions, see the [Astro documentation](https://docs.astro.build).

For Tailwind CSS questions, see the [Tailwind documentation](https://tailwindcss.com/docs).

## License

This project is open source and available under the MIT License.
