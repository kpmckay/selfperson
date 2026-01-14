// State
let currentImages = [];
let isEditing = false;

// DOM Elements
const postListSection = document.getElementById('post-list-section');
const editorSection = document.getElementById('editor-section');
const editorTitle = document.getElementById('editor-title');
const postList = document.getElementById('post-list');
const postForm = document.getElementById('post-form');
const originalFilename = document.getElementById('original-filename');
const newPostBtn = document.getElementById('new-post-btn');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const uploadBtn = document.getElementById('upload-btn');
const imageInput = document.getElementById('image-input');
const imageListEl = document.getElementById('image-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  setupEventListeners();
});

function setupEventListeners() {
  newPostBtn.addEventListener('click', showNewPostForm);
  cancelBtn.addEventListener('click', showPostList);
  postForm.addEventListener('submit', handleSubmit);
  deleteBtn.addEventListener('click', handleDelete);
  uploadBtn.addEventListener('click', handleImageUpload);
}

// API Functions
async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    renderPostList(posts);
  } catch (err) {
    alert('Failed to load posts: ' + err.message);
  }
}

async function loadPost(filename) {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(filename)}`);
    if (!res.ok) throw new Error('Post not found');
    return await res.json();
  } catch (err) {
    alert('Failed to load post: ' + err.message);
    return null;
  }
}

async function savePost(data, filename = null) {
  try {
    const url = filename ? `/api/posts/${encodeURIComponent(filename)}` : '/api/posts';
    const method = filename ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result;
  } catch (err) {
    alert('Failed to save post: ' + err.message);
    return null;
  }
}

async function deletePost(filename) {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result;
  } catch (err) {
    alert('Failed to delete post: ' + err.message);
    return null;
  }
}

async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result.path;
  } catch (err) {
    alert('Failed to upload image: ' + err.message);
    return null;
  }
}

// UI Functions
function renderPostList(posts) {
  if (posts.length === 0) {
    postList.innerHTML = '<p class="empty-state">No posts yet. Create your first post!</p>';
    return;
  }

  postList.innerHTML = posts.map(post => `
    <div class="post-item" data-filename="${post.filename}">
      <div class="post-info">
        <span class="post-date">${formatDate(post.date)}</span>
        ${post.tag ? `<span class="post-tag">${post.tag}</span>` : ''}
      </div>
      <div class="post-title">${escapeHtml(post.title)}</div>
    </div>
  `).join('');

  // Add click handlers
  postList.querySelectorAll('.post-item').forEach(item => {
    item.addEventListener('click', () => {
      editPost(item.dataset.filename);
    });
  });
}

function showPostList() {
  editorSection.classList.add('hidden');
  postListSection.classList.remove('hidden');
  loadPosts();
}

function showNewPostForm() {
  isEditing = false;
  currentImages = [];
  editorTitle.textContent = 'New Post';
  originalFilename.value = '';
  postForm.reset();
  deleteBtn.classList.add('hidden');

  // Set default date to today
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  renderImageList();
  postListSection.classList.add('hidden');
  editorSection.classList.remove('hidden');
}

async function editPost(filename) {
  const post = await loadPost(filename);
  if (!post) return;

  isEditing = true;
  editorTitle.textContent = 'Edit Post';
  originalFilename.value = filename;
  deleteBtn.classList.remove('hidden');

  // Populate form
  document.getElementById('date').value = post.date;
  document.getElementById('title').value = post.title || '';
  document.getElementById('summary').value = post.summary || '';
  document.getElementById('tag').value = post.tag || '';
  document.getElementById('link').value = post.link || '';
  document.getElementById('linkText').value = post.linkText || '';

  // Handle images
  currentImages = Array.isArray(post.images) ? [...post.images] : [];
  renderImageList();

  postListSection.classList.add('hidden');
  editorSection.classList.remove('hidden');
}

function renderImageList() {
  if (currentImages.length === 0) {
    imageListEl.innerHTML = '<p class="empty-state">No images attached</p>';
    return;
  }

  imageListEl.innerHTML = currentImages.map((img, index) => `
    <div class="image-item">
      <img src="${img}" alt="Uploaded image" class="thumbnail">
      <span class="image-path">${img}</span>
      <button type="button" class="btn btn-small btn-danger" data-index="${index}">Remove</button>
    </div>
  `).join('');

  // Add remove handlers
  imageListEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      currentImages.splice(index, 1);
      renderImageList();
    });
  });
}

async function handleSubmit(e) {
  e.preventDefault();

  const data = {
    date: document.getElementById('date').value,
    title: document.getElementById('title').value,
    summary: document.getElementById('summary').value,
    tag: document.getElementById('tag').value || null,
    link: document.getElementById('link').value || null,
    linkText: document.getElementById('linkText').value || null,
    images: currentImages.length > 0 ? currentImages : null
  };

  const filename = isEditing ? originalFilename.value : null;
  const result = await savePost(data, filename);

  if (result) {
    showPostList();
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this post?')) return;

  const filename = originalFilename.value;
  const result = await deletePost(filename);

  if (result) {
    showPostList();
  }
}

async function handleImageUpload() {
  const file = imageInput.files[0];
  if (!file) {
    alert('Please select an image file');
    return;
  }

  const path = await uploadImage(file);
  if (path) {
    currentImages.push(path);
    renderImageList();
    imageInput.value = '';
  }
}

// Utility Functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
