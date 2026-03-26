const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3002;

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');

if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve co-located article images for editor preview
app.get('/images/:slug/:filename', (req, res) => {
  const filepath = path.join(
    ARTICLES_DIR,
    req.params.slug,
    'images',
    req.params.filename
  );
  if (!fs.existsSync(filepath)) return res.status(404).send('Not found');
  res.sendFile(filepath);
});

// Multer: images go into the article's own images/ directory
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const slug = req.body.slug;
      if (!slug) return cb(new Error('slug is required'));
      const dir = path.join(ARTICLES_DIR, slug, 'images');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, sanitized);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
      && /jpeg|jpg|png|gif|webp/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only image files are allowed'));
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────

function parseArticle(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)/);
    if (m) {
      frontmatter[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }

  return { frontmatter, body: match[2].trim() };
}

function generateFile(data) {
  let content = '---\n';
  content += `date: ${data.date}\n`;
  content += `title: "${data.title.replace(/"/g, '\\"')}"\n`;
  content += `description: "${data.description.replace(/"/g, '\\"')}"\n`;
  if (data.tag) content += `tag: "${data.tag.replace(/"/g, '\\"')}"\n`;
  content += '---\n\n';
  content += (data.body || '').trimEnd();
  content += '\n';
  return content;
}

function generateSlug(date, title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  return `${date}-${slug}`;
}

function listArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR)
    .filter(entry => {
      const indexPath = path.join(ARTICLES_DIR, entry, 'index.md');
      return fs.existsSync(indexPath);
    })
    .map(slug => {
      const content = fs.readFileSync(path.join(ARTICLES_DIR, slug, 'index.md'), 'utf-8');
      const { frontmatter } = parseArticle(content);
      return { slug, ...frontmatter };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/articles', (req, res) => {
  try {
    res.json(listArticles());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles/:slug', (req, res) => {
  try {
    const indexPath = path.join(ARTICLES_DIR, req.params.slug, 'index.md');
    if (!fs.existsSync(indexPath)) return res.status(404).json({ error: 'Article not found' });
    const content = fs.readFileSync(indexPath, 'utf-8');
    const { frontmatter, body } = parseArticle(content);
    // List images already in the article's images/ dir
    const imagesDir = path.join(ARTICLES_DIR, req.params.slug, 'images');
    const images = fs.existsSync(imagesDir)
      ? fs.readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      : [];
    res.json({ slug: req.params.slug, ...frontmatter, body, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', (req, res) => {
  try {
    const data = req.body;
    if (!data.date || !data.title || !data.description) {
      return res.status(400).json({ error: 'Date, title, and description are required' });
    }
    const slug = generateSlug(data.date, data.title);
    const articleDir = path.join(ARTICLES_DIR, slug);
    if (fs.existsSync(path.join(articleDir, 'index.md'))) {
      return res.status(400).json({ error: 'An article with this date and title already exists' });
    }
    fs.mkdirSync(path.join(articleDir, 'images'), { recursive: true });
    fs.writeFileSync(path.join(articleDir, 'index.md'), generateFile(data));
    res.json({ success: true, slug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/articles/:slug', (req, res) => {
  try {
    const indexPath = path.join(ARTICLES_DIR, req.params.slug, 'index.md');
    if (!fs.existsSync(indexPath)) return res.status(404).json({ error: 'Article not found' });
    const data = req.body;
    if (!data.date || !data.title || !data.description) {
      return res.status(400).json({ error: 'Date, title, and description are required' });
    }
    fs.writeFileSync(indexPath, generateFile(data));
    res.json({ success: true, slug: req.params.slug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:slug', (req, res) => {
  try {
    const articleDir = path.join(ARTICLES_DIR, req.params.slug);
    if (!fs.existsSync(articleDir)) return res.status(404).json({ error: 'Article not found' });
    fs.rmSync(articleDir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const slug = req.body.slug;
    res.json({
      success: true,
      filename: req.file.filename,
      previewUrl: `/images/${slug}/${req.file.filename}`,
      markdown: `./images/${req.file.filename}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:slug/images/:filename', (req, res) => {
  try {
    const filepath = path.join(ARTICLES_DIR, req.params.slug, 'images', req.params.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Article editor running at http://localhost:${PORT}`);
});
