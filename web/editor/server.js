const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Paths
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content', 'feed');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Ensure directories exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    // Keep original filename but sanitize it
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, sanitized);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper: Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let inArray = false;

  for (const line of lines) {
    // Check for array item
    if (inArray && line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      frontmatter[currentKey].push(value);
      continue;
    }

    // Check for key: value
    const keyMatch = line.match(/^(\w+):\s*(.*)/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      currentKey = key;
      inArray = false;

      if (value === '') {
        // Could be start of array
        frontmatter[key] = [];
        inArray = true;
      } else {
        // Remove quotes if present
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return frontmatter;
}

// Helper: Generate frontmatter string
function generateFrontmatter(data) {
  let fm = '---\n';
  fm += `date: ${data.date}\n`;
  fm += `title: "${data.title.replace(/"/g, '\\"')}"\n`;
  fm += `summary: "${data.summary.replace(/"/g, '\\"')}"\n`;

  if (data.link) {
    fm += `link: "${data.link}"\n`;
  }
  if (data.linkText) {
    fm += `linkText: "${data.linkText}"\n`;
  }
  if (data.tag) {
    fm += `tag: "${data.tag}"\n`;
  }
  if (data.images && data.images.length > 0) {
    fm += 'images:\n';
    for (const img of data.images) {
      fm += `  - ${img}\n`;
    }
  }

  fm += '---\n';
  return fm;
}

// Helper: Generate filename from date and title
function generateFilename(date, title) {
  const dateStr = date.replace(/-/g, '-');
  const [year, month, day] = dateStr.split('-');
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  return `${month}-${day}-${year}-${slug}.md`;
}

// API Routes

// GET /api/posts - List all posts
app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const posts = files.map(filename => {
      const content = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8');
      const frontmatter = parseFrontmatter(content);
      return {
        filename,
        ...frontmatter
      };
    });

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:filename - Get single post
app.get('/api/posts/:filename', (req, res) => {
  try {
    const filepath = path.join(CONTENT_DIR, req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    res.json({ filename: req.params.filename, ...frontmatter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - Create new post
app.post('/api/posts', (req, res) => {
  try {
    const data = req.body;
    if (!data.date || !data.title || !data.summary) {
      return res.status(400).json({ error: 'Date, title, and summary are required' });
    }

    const filename = generateFilename(data.date, data.title);
    const filepath = path.join(CONTENT_DIR, filename);

    if (fs.existsSync(filepath)) {
      return res.status(400).json({ error: 'A post with this date and title already exists' });
    }

    const content = generateFrontmatter(data);
    fs.writeFileSync(filepath, content);
    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:filename - Update existing post
app.put('/api/posts/:filename', (req, res) => {
  try {
    const filepath = path.join(CONTENT_DIR, req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const data = req.body;
    if (!data.date || !data.title || !data.summary) {
      return res.status(400).json({ error: 'Date, title, and summary are required' });
    }

    const content = generateFrontmatter(data);
    fs.writeFileSync(filepath, content);
    res.json({ success: true, filename: req.params.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:filename - Delete post
app.delete('/api/posts/:filename', (req, res) => {
  try {
    const filepath = path.join(CONTENT_DIR, req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Post not found' });
    }
    fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload - Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const imagePath = `/images/${req.file.filename}`;
    res.json({ success: true, path: imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/images - List uploaded images
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(IMAGES_DIR).filter(f =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    );
    const images = files.map(f => `/images/${f}`);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Feed editor running at http://localhost:${PORT}`);
});
