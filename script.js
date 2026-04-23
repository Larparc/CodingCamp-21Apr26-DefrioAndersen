// ===== LOCAL STORAGE KEYS =====
const STORAGE_KEYS = {
    tasks:    'productivity_tasks',
    links:    'productivity_links',
    theme:    'productivity_theme',
    userName: 'productivity_username'
};

// ===== THEME =====
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem(STORAGE_KEYS.theme, theme);
}

document.getElementById('themeToggle').addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme
applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'light');

// ===== SETTINGS MODAL =====
document.getElementById('settingsBtn').addEventListener('click', function () {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    // Pre-fill current values
    const savedName = localStorage.getItem(STORAGE_KEYS.userName) || '';
    document.getElementById('nameInput').value = savedName;
    const savedMin = Math.round((localStorage.getItem(STORAGE_KEYS.pomodoroDur) || 1500) / 60);
    document.getElementById('pomodoroInput').value = savedMin;
});

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

document.getElementById('settingsModal').addEventListener('click', function (e) {
    if (e.target === this) closeSettings();
});

// ===== CUSTOM NAME =====
function saveName() {
    const name = document.getElementById('nameInput').value.trim();
    localStorage.setItem(STORAGE_KEYS.userName, name);
    updateDateTime(); // refresh greeting immediately
}

// ===== GREETING & DATETIME =====
function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 18) return 'Good Afternoon';
    return 'Good Night';
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('date').textContent = now.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const name = localStorage.getItem(STORAGE_KEYS.userName);
    const base = getGreeting(now.getHours());
    document.getElementById('greeting').textContent = name ? `${base}, ${name}!` : base;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// ===== TIMER =====
let timerInterval = null;
let remainingSeconds = 0;
let isRunning = false;
const display = document.getElementById('timerDisplay');

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function parseDisplay() {
    const text = display.textContent.trim();
    const parts = text.split(':');
    if (parts.length === 2) {
        const m = parseInt(parts[0]) || 0;
        const s = parseInt(parts[1]) || 0;
        return m * 60 + Math.min(s, 59);
    }
    return 0;
}

function updateDisplay() {
    display.textContent = formatTime(remainingSeconds);
}

function setEditable(val) {
    display.contentEditable = val ? 'true' : 'false';
    display.style.cursor = val ? 'text' : 'default';
}

function setStartStopState(started) {
    const startBtn = document.getElementById('startBtn');
    const stopBtn  = document.getElementById('stopBtn');
    startBtn.disabled = started;
    startBtn.className = started ? 'btn btn-disabled' : 'btn btn-primary';
    stopBtn.disabled = !started;
    stopBtn.className = !started ? 'btn btn-disabled' : 'btn btn-primary';
}

function startTimer() {
    if (isRunning) return;
    if (remainingSeconds === 0) {
        remainingSeconds = parseDisplay();
        if (remainingSeconds === 0) return;
    }
    setEditable(false);
    isRunning = true;
    setStartStopState(true);
    timerInterval = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            setStartStopState(false);
            display.textContent = 'Selesai!';
            setEditable(false);
            return;
        }
        remainingSeconds--;
        updateDisplay();
    }, 1000);
}

function stopTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    setStartStopState(false);
    setEditable(true);
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = parseDisplay();
    setStartStopState(false);
    updateDisplay();
    setEditable(true);
}

display.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); display.blur(); }
});

display.addEventListener('blur', function () {
    let total = parseDisplay();
    if (total < 0) total = 0;
    remainingSeconds = total;
    updateDisplay();
});

// Init timer
remainingSeconds = 25 * 60;
updateDisplay();
setEditable(true);

// ===== TASK - LOCAL STORAGE =====
let tasks = [];

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEYS.tasks);
    return saved ? JSON.parse(saved) : [];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function renderAllTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach(t => renderTask(t));
}

function renderTask(taskObj) {
    const li = document.createElement('li');
    li.className = 'task-item' + (taskObj.done ? ' done' : '');
    li.dataset.id = taskObj.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = taskObj.done;
    checkbox.onchange = function () {
        taskObj.done = checkbox.checked;
        li.classList.toggle('done', taskObj.done);
        saveTasks();
    };

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = taskObj.text;

    const editBtn = document.createElement('button');
    editBtn.className = 'task-edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = function () {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input text-input';
        input.value = taskObj.text;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'task-save';
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'task-cancel';
        cancelBtn.textContent = 'Cancel';

        li.replaceChild(input, span);
        li.replaceChild(saveBtn, editBtn);
        li.insertBefore(cancelBtn, deleteBtn);
        input.focus();

        saveBtn.onclick = function () {
            const newText = input.value.trim();
            if (!newText) return;
            // Prevent duplicate on edit (ignore self)
            const duplicate = tasks.some(t => t.id !== taskObj.id && t.text.toLowerCase() === newText.toLowerCase());
            if (duplicate) {
                input.style.borderColor = '#ef4444';
                return;
            }
            taskObj.text = newText;
            span.textContent = newText;
            li.replaceChild(span, input);
            li.replaceChild(editBtn, saveBtn);
            cancelBtn.remove();
            saveTasks();
        };

        cancelBtn.onclick = function () {
            li.replaceChild(span, input);
            li.replaceChild(editBtn, saveBtn);
            cancelBtn.remove();
        };

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') saveBtn.onclick();
            if (e.key === 'Escape') cancelBtn.onclick();
        });
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function () {
        tasks = tasks.filter(t => t.id !== taskObj.id);
        li.remove();
        saveTasks();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    document.getElementById('taskList').appendChild(li);
}

function showDuplicateWarning() {
    const el = document.getElementById('duplicateWarning');
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), 2500);
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;

    // Prevent duplicate (case-insensitive)
    const duplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (duplicate) {
        showDuplicateWarning();
        input.select();
        return;
    }

    const task = { id: Date.now().toString(), text, done: false };
    tasks.push(task);
    renderTask(task);
    saveTasks();
    input.value = '';
    input.focus();
}

document.getElementById('taskInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
});

// ===== SORT TASKS =====
function sortTasks() {
    const mode = document.getElementById('sortSelect').value;
    let sorted = [...tasks];
    if (mode === 'az')     sorted.sort((a, b) => a.text.localeCompare(b.text));
    if (mode === 'za')     sorted.sort((a, b) => b.text.localeCompare(a.text));
    if (mode === 'done')   sorted.sort((a, b) => Number(a.done) - Number(b.done));
    if (mode === 'undone') sorted.sort((a, b) => Number(b.done) - Number(a.done));
    // Re-render in sorted order without mutating the source array
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    sorted.forEach(t => renderTask(t));
}

// Load saved tasks on startup
tasks = loadTasks();
renderAllTasks();

// ===== QUICK LINKS - LOCAL STORAGE =====
function loadLinks() {
    const saved = localStorage.getItem(STORAGE_KEYS.links);
    return saved ? JSON.parse(saved) : [
        { name: 'Google',   url: 'https://www.google.com' },
        { name: 'Gmail',    url: 'https://mail.google.com' },
        { name: 'Calendar', url: 'https://calendar.google.com' }
    ];
}

function saveLinks() {
    const cards = document.querySelectorAll('#linkGrid .link-card');
    const links = Array.from(cards).map(card => ({
        name: card.querySelector('.link-anchor').textContent,
        url:  card.querySelector('.link-anchor').href
    }));
    localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

function renderLinkCard(name, url) {
    const card = document.createElement('div');
    card.className = 'link-card';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'link-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Hapus link';
    deleteBtn.onclick = function (e) {
        e.stopPropagation();
        card.remove();
        saveLinks();
    };

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className = 'link-anchor';
    anchor.textContent = name;

    card.onclick = function () { window.open(url, '_blank', 'noopener,noreferrer'); };
    card.appendChild(deleteBtn);
    card.appendChild(anchor);
    document.getElementById('linkGrid').appendChild(card);
}

function addLink() {
    const nameInput = document.getElementById('linkName');
    const urlInput  = document.getElementById('linkUrl');
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    renderLinkCard(name, url);
    saveLinks();
    nameInput.value = '';
    urlInput.value = '';
    nameInput.focus();
}

// Load saved links on startup
loadLinks().forEach(link => renderLinkCard(link.name, link.url));
