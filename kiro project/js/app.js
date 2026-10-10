/* =============================================
   Personal Dashboard — app.js
   Vanilla JS | localStorage | No frameworks
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
// 1. GREETING & CLOCK
// ─────────────────────────────────────────────

const elTime     = document.getElementById('current-time');
const elDate     = document.getElementById('current-date');
const elGreeting = document.getElementById('greeting-text');

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return '☀️ Good Morning!';
  if (hour >= 12 && hour < 17) return '🌤️ Good Afternoon!';
  if (hour >= 17 && hour < 21) return '🌆 Good Evening!';
  return '🌙 Good Night!';
}

function updateClock() {
  const now  = new Date();
  const h    = String(now.getHours()).padStart(2, '0');
  const m    = String(now.getMinutes()).padStart(2, '0');
  const s    = String(now.getSeconds()).padStart(2, '0');

  elTime.textContent = `${h}:${m}:${s}`;

  elDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  elGreeting.textContent = getGreeting(now.getHours());
}

updateClock();
setInterval(updateClock, 1000);


// ─────────────────────────────────────────────
// 2. FOCUS TIMER
// ─────────────────────────────────────────────

const TIMER_DURATION = 25 * 60; // seconds

const elTimerDisplay = document.getElementById('timer-display');
const elTimerLabel   = document.getElementById('timer-label');
const btnStart       = document.getElementById('btn-start');
const btnStop        = document.getElementById('btn-stop');
const btnReset       = document.getElementById('btn-reset');

let timerSeconds   = TIMER_DURATION;
let timerInterval  = null;
let timerRunning   = false;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  elTimerDisplay.textContent = formatTime(timerSeconds);
  elTimerDisplay.classList.toggle('running', timerRunning);
  elTimerDisplay.classList.toggle('finished', timerSeconds === 0);
  btnStart.disabled = timerRunning || timerSeconds === 0;
  btnStop.disabled  = !timerRunning;
}

function startTimer() {
  if (timerRunning || timerSeconds === 0) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      timerSeconds = 0;
      clearInterval(timerInterval);
      timerRunning = false;
      elTimerLabel.textContent = '🎉 Session complete!';
    }
    renderTimer();
  }, 1000);
  renderTimer();
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  renderTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerSeconds  = TIMER_DURATION;
  elTimerLabel.textContent = 'Pomodoro Session';
  renderTimer();
}

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click',  stopTimer);
btnReset.addEventListener('click', resetTimer);

renderTimer();


// ─────────────────────────────────────────────
// 3. TO-DO LIST
// ─────────────────────────────────────────────

const TODO_KEY      = 'dashboard_todos';
const elTodoInput   = document.getElementById('todo-input');
const elTodoList    = document.getElementById('todo-list');
const elTodoEmpty   = document.getElementById('todo-empty');
const btnAddTodo    = document.getElementById('btn-add-todo');
const editModal     = document.getElementById('edit-modal');
const editInput     = document.getElementById('edit-input');
const btnSaveEdit   = document.getElementById('btn-save-edit');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

let todos       = loadTodos();
let editingId   = null;

/* ── Storage helpers ── */
function loadTodos() {
  try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; }
  catch { return []; }
}

function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

/* ── Render ── */
function renderTodos() {
  elTodoList.innerHTML = '';
  elTodoEmpty.classList.toggle('hidden', todos.length > 0);

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.done ? 'checked' : ''} aria-label="Mark done" />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="btn-icon btn-edit" title="Edit task" aria-label="Edit task">✏️</button>
        <button class="btn-danger btn-delete" title="Delete task" aria-label="Delete task">🗑</button>
      </div>`;

    elTodoList.appendChild(li);
  });
}

/* ── Add ── */
function addTodo() {
  const text = elTodoInput.value.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  renderTodos();
  elTodoInput.value = '';
  elTodoInput.focus();
}

/* ── Event delegation on list ── */
elTodoList.addEventListener('click', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('btn-edit')) {
    openEditModal(id);
  } else if (e.target.classList.contains('btn-delete')) {
    deleteTodo(id);
  }
});

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.done = !todo.done; saveTodos(); renderTodos(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

/* ── Edit modal ── */
function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editingId = id;
  editInput.value = todo.text;
  editModal.classList.remove('hidden');
  editInput.focus();
  editInput.select();
}

function closeEditModal() {
  editingId = null;
  editModal.classList.add('hidden');
}

function saveEdit() {
  const text = editInput.value.trim();
  if (!text) return;
  const todo = todos.find(t => t.id === editingId);
  if (todo) { todo.text = text; saveTodos(); renderTodos(); }
  closeEditModal();
}

btnSaveEdit.addEventListener('click', saveEdit);
btnCancelEdit.addEventListener('click', closeEditModal);
editInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') closeEditModal(); });

/* ── Close modal on overlay click ── */
editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

/* ── Keyboard shortcut: Enter to add ── */
btnAddTodo.addEventListener('click', addTodo);
elTodoInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

renderTodos();


// ─────────────────────────────────────────────
// 4. QUICK LINKS
// ─────────────────────────────────────────────

const LINKS_KEY       = 'dashboard_links';
const elLinksGrid     = document.getElementById('links-grid');
const elLinksEmpty    = document.getElementById('links-empty');
const elLinkName      = document.getElementById('link-name-input');
const elLinkUrl       = document.getElementById('link-url-input');
const btnAddLink      = document.getElementById('btn-add-link');

let links = loadLinks();

function loadLinks() {
  try { return JSON.parse(localStorage.getItem(LINKS_KEY)) || getDefaultLinks(); }
  catch { return getDefaultLinks(); }
}

function getDefaultLinks() {
  return [
    { id: 1, name: 'Google',  url: 'https://www.google.com' },
    { id: 2, name: 'GitHub',  url: 'https://github.com' },
    { id: 3, name: 'YouTube', url: 'https://www.youtube.com' },
  ];
}

function saveLinks() {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function renderLinks() {
  elLinksGrid.innerHTML = '';
  elLinksEmpty.classList.toggle('hidden', links.length > 0);

  links.forEach(link => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';
    chip.dataset.id = link.id;

    // Favicon from Google's service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=16`;

    chip.innerHTML = `
      <img src="${faviconUrl}" width="16" height="16" alt="" onerror="this.style.display='none'" />
      <a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer"
         class="link-label" aria-label="Open ${escapeHtml(link.name)}">${escapeHtml(link.name)}</a>
      <button class="link-remove" data-id="${link.id}" title="Remove link" aria-label="Remove ${escapeHtml(link.name)}">×</button>`;

    elLinksGrid.appendChild(chip);
  });
}

function addLink() {
  const name = elLinkName.value.trim();
  let   url  = elLinkUrl.value.trim();

  if (!name || !url) {
    alert('Please enter both a label and a URL.');
    return;
  }

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
  elLinkName.value = '';
  elLinkUrl.value  = '';
  elLinkName.focus();
}

elLinksGrid.addEventListener('click', e => {
  const removeBtn = e.target.closest('.link-remove');
  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    links = links.filter(l => l.id !== id);
    saveLinks();
    renderLinks();
  }
});

btnAddLink.addEventListener('click', addLink);
elLinkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
elLinkName.addEventListener('keydown', e => { if (e.key === 'Enter') elLinkUrl.focus(); });

renderLinks();


// ─────────────────────────────────────────────
// 5. UTILITIES
// ─────────────────────────────────────────────

/** Escape HTML to prevent XSS when setting innerHTML */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Escape for HTML attribute values */
function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}
