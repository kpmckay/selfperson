// State
let currentSlug = null; // null = new article not yet saved

// DOM
const articleListSection = document.getElementById('article-list-section');
const editorSection = document.getElementById('editor-section');
const editorTitle = document.getElementById('editor-title');
const articleList = document.getElementById('article-list');
const articleForm = document.getElementById('article-form');
const originalSlug = document.getElementById('original-slug');
const newArticleBtn = document.getElementById('new-article-btn');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const inlineImageInput = document.getElementById('inline-image-input');
const insertImageBtn = document.getElementById('insert-image-btn');
const bodyTextarea = document.getElementById('body');
const previewPane = document.getElementById('preview-pane');
const imageStrip = document.getElementById('image-strip');
const editTab = document.getElementById('edit-tab');
const previewTab = document.getElementById('preview-tab');

document.addEventListener('DOMContentLoaded', () => {
  loadArticles();
  newArticleBtn.addEventListener('click', showNewArticleForm);
  cancelBtn.addEventListener('click', showArticleList);
  articleForm.addEventListener('submit', handleSubmit);
  deleteBtn.addEventListener('click', handleDelete);
  insertImageBtn.addEventListener('click', handleInsertImageClick);
  inlineImageInput.addEventListener('change', handleInlineImageUpload);
  editTab.addEventListener('click', showEditMode);
  previewTab.addEventListener('click', showPreviewMode);
});

// ── API ────────────────────────────────────────────────────────────────────

async function loadArticles() {
  try {
    const res = await fetch('/api/articles');
    renderArticleList(await res.json());
  } catch (err) {
    alert('Failed to load articles: ' + err.message);
  }
}

async function loadArticle(slug) {
  const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

async function saveArticle(data, slug) {
  const url = slug ? `/api/articles/${encodeURIComponent(slug)}` : '/api/articles';
  const res = await fetch(url, {
    method: slug ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error);
  return result;
}

async function uploadImage(file, slug) {
  const formData = new FormData();
  formData.append('slug', slug); // must come before the file so multer can read it
  formData.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error);
  return result;
}

async function deleteImage(slug, filename) {
  const res = await fetch(
    `/api/articles/${encodeURIComponent(slug)}/images/${encodeURIComponent(filename)}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error((await res.json()).error);
}

// ── UI ─────────────────────────────────────────────────────────────────────

function renderArticleList(articles) {
  if (articles.length === 0) {
    articleList.innerHTML = '<p class="empty-state">No articles yet. Create your first one!</p>';
    return;
  }
  articleList.innerHTML = articles.map(a => `
    <div class="post-item" data-slug="${escapeHtml(a.slug)}">
      <div class="post-info">
        <span class="post-date">${formatDate(a.date)}</span>
        ${a.tag ? `<span class="post-tag">${escapeHtml(a.tag)}</span>` : ''}
      </div>
      <div class="post-title">${escapeHtml(a.title)}</div>
      ${a.description ? `<div class="post-description">${escapeHtml(a.description)}</div>` : ''}
    </div>
  `).join('');
  articleList.querySelectorAll('.post-item').forEach(item => {
    item.addEventListener('click', () => editArticle(item.dataset.slug));
  });
}

function showArticleList() {
  editorSection.classList.add('hidden');
  articleListSection.classList.remove('hidden');
  loadArticles();
}

function showNewArticleForm() {
  currentSlug = null;
  editorTitle.textContent = 'New Article';
  originalSlug.value = '';
  articleForm.reset();
  deleteBtn.classList.add('hidden');
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  renderImageStrip([]);
  showEditMode();
  articleListSection.classList.add('hidden');
  editorSection.classList.remove('hidden');
  document.getElementById('title').focus();
}

async function editArticle(slug) {
  let article;
  try { article = await loadArticle(slug); }
  catch (err) { alert('Failed to load article: ' + err.message); return; }

  currentSlug = slug;
  editorTitle.textContent = 'Edit Article';
  originalSlug.value = slug;
  deleteBtn.classList.remove('hidden');

  document.getElementById('date').value = article.date || '';
  document.getElementById('title').value = article.title || '';
  document.getElementById('description').value = article.description || '';
  document.getElementById('tag').value = article.tag || '';
  bodyTextarea.value = article.body || '';

  renderImageStrip(article.images || []);
  showEditMode();
  articleListSection.classList.add('hidden');
  editorSection.classList.remove('hidden');
}

function renderImageStrip(filenames) {
  if (filenames.length === 0) {
    imageStrip.innerHTML = '';
    return;
  }
  const slug = currentSlug || deriveSlug(
    document.getElementById('date').value,
    document.getElementById('title').value
  );
  imageStrip.innerHTML = `
    <div class="strip-label">Images in this article — click to re-insert:</div>
    <div class="strip-thumbs">
      ${filenames.map(f => `
        <div class="strip-item" title="${escapeHtml(f)}">
          <img src="/images/${escapeHtml(slug)}/${escapeHtml(f)}" alt="${escapeHtml(f)}">
          <button type="button" class="strip-insert" data-markdown="./images/${escapeHtml(f)}">Insert</button>
          <button type="button" class="strip-remove btn-danger" data-filename="${escapeHtml(f)}" title="Delete image">✕</button>
        </div>
      `).join('')}
    </div>
  `;
  imageStrip.querySelectorAll('.strip-insert').forEach(btn => {
    btn.addEventListener('click', () => insertImageAtCursor(btn.dataset.markdown, ''));
  });
  imageStrip.querySelectorAll('.strip-remove').forEach(btn => {
    btn.addEventListener('click', () => handleRemoveImage(btn.dataset.filename));
  });
}

// ── Handlers ───────────────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();
  const data = {
    date: document.getElementById('date').value,
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    tag: document.getElementById('tag').value || null,
    body: bodyTextarea.value
  };
  try {
    const result = await saveArticle(data, currentSlug);
    if (!currentSlug) currentSlug = result.slug;
    showArticleList();
  } catch (err) {
    alert('Failed to save article: ' + err.message);
  }
}

async function handleDelete() {
  if (!confirm('Delete this article and all its images?')) return;
  try {
    await (await fetch(`/api/articles/${encodeURIComponent(currentSlug)}`, { method: 'DELETE' })).json();
    showArticleList();
  } catch (err) {
    alert('Failed to delete: ' + err.message);
  }
}

function handleInsertImageClick() {
  const titleInput = document.getElementById('title');
  if (!titleInput.value.trim()) {
    titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleInput.focus();
    titleInput.classList.add('field-required');
    setTimeout(() => titleInput.classList.remove('field-required'), 2500);
    return;
  }
  inlineImageInput.click();
}

async function handleInlineImageUpload() {
  const file = inlineImageInput.files[0];
  if (!file) return;

  const slug = currentSlug || deriveSlug(
    document.getElementById('date').value,
    document.getElementById('title').value
  );

  insertImageBtn.disabled = true;
  insertImageBtn.textContent = 'Uploading…';

  try {
    const result = await uploadImage(file, slug);
    insertImageAtCursor(result.markdown, '');
    try {
      const article = await loadArticle(slug);
      renderImageStrip(article.images || []);
    } catch {
      // Article not saved yet; strip will refresh on next load
    }
  } catch (err) {
    alert('Upload failed: ' + err.message);
  } finally {
    insertImageBtn.disabled = false;
    insertImageBtn.textContent = '📷 Insert Image';
    inlineImageInput.value = '';
  }
}

async function handleRemoveImage(filename) {
  const slug = currentSlug;
  if (!slug) return;
  if (!confirm(`Delete "${filename}" from this article?`)) return;
  try {
    await deleteImage(slug, filename);
    const article = await loadArticle(slug);
    renderImageStrip(article.images || []);
    // Strip references from body
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    bodyTextarea.value = bodyTextarea.value.replace(
      new RegExp(`!\\[[^\\]]*\\]\\(\\./images/${escaped}\\)`, 'g'), ''
    );
  } catch (err) {
    alert('Failed to remove image: ' + err.message);
  }
}

// ── Preview ────────────────────────────────────────────────────────────────

function showEditMode() {
  bodyTextarea.classList.remove('hidden');
  previewPane.classList.add('hidden');
  editTab.classList.add('active');
  previewTab.classList.remove('active');
  insertImageBtn.disabled = false;
}

function showPreviewMode() {
  const slug = currentSlug || deriveSlug(
    document.getElementById('date').value,
    document.getElementById('title').value
  );
  previewPane.innerHTML = renderMarkdown(bodyTextarea.value, slug);
  // Open images full-size in a new tab on click
  previewPane.querySelectorAll('img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => window.open(img.src, '_blank'));
  });
  bodyTextarea.classList.add('hidden');
  previewPane.classList.remove('hidden');
  previewTab.classList.add('active');
  editTab.classList.remove('active');
  insertImageBtn.disabled = true;
}

function renderMarkdown(text, slug) {
  const raw = marked.parse(text);
  const container = document.createElement('div');
  container.innerHTML = raw;

  // Rewrite ./images/ paths to the editor's serving route
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('./images/')) {
      img.src = `/images/${slug}/${src.slice('./images/'.length)}`;
    }
  });

  // Mirror the rehype plugin: convert image-only <p> elements to <figure>,
  // and group consecutive ones into a .figure-row
  const nodes = [...container.childNodes];
  let group = [];

  function flushGroup() {
    if (group.length === 0) return;
    const elements = group.map(p => {
      const img = p.querySelector('img');
      const alt = img.getAttribute('alt') || '';
      const figure = document.createElement('figure');
      figure.appendChild(img.cloneNode(true));
      if (alt) {
        const cap = document.createElement('figcaption');
        cap.textContent = alt;
        figure.appendChild(cap);
      }
      return figure;
    });
    if (elements.length === 1) {
      group[0].replaceWith(elements[0]);
    } else {
      const row = document.createElement('div');
      row.className = 'figure-row';
      elements.forEach(f => row.appendChild(f));
      group[0].replaceWith(row);
      group.slice(1).forEach(p => p.remove());
    }
    group = [];
  }

  nodes.forEach(node => {
    if (isImgOnlyParagraph(node)) {
      group.push(node);
    } else {
      flushGroup();
    }
  });
  flushGroup();

  return container.innerHTML;
}

function isImgOnlyParagraph(node) {
  if (!node || node.tagName !== 'P') return false;
  const meaningful = [...node.childNodes].filter(
    c => !(c.nodeType === Node.TEXT_NODE && !c.textContent.trim()) && c.nodeName !== 'BR'
  );
  return meaningful.length === 1 && meaningful[0].tagName === 'IMG';
}

// ── Utilities ──────────────────────────────────────────────────────────────

// Insert markdown at cursor; cursor ends up between [ and ] so user types caption.
function insertImageAtCursor(imagePath, caption) {
  const prefix = `\n![${caption}](${imagePath})`;
  const suffix = '\n';
  const start = bodyTextarea.selectionStart;
  const end = bodyTextarea.selectionEnd;
  bodyTextarea.value =
    bodyTextarea.value.substring(0, start) + prefix + suffix + bodyTextarea.value.substring(end);
  // Place cursor between [ and ]
  const captionStart = start + 2; // after "\n!["
  bodyTextarea.selectionStart = captionStart;
  bodyTextarea.selectionEnd = captionStart + caption.length;
  bodyTextarea.focus();
}

function deriveSlug(date, title) {
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
  return `${date}-${s}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
