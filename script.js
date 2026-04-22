// greeting
function updateDateTime() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('date').textContent = now.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateDateTime();
setInterval(updateDateTime, 1000);

// timer
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
    const stopBtn = document.getElementById('stopBtn');
    startBtn.disabled = started;
    startBtn.style.background = started ? '#aaa' : '#b06ee8';
    startBtn.style.cursor = started ? 'not-allowed' : 'pointer';
    stopBtn.disabled = !started;
    stopBtn.style.background = !started ? '#aaa' : '#b06ee8';
    stopBtn.style.cursor = !started ? 'not-allowed' : 'pointer';
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

remainingSeconds = 5 * 60;
updateDisplay();
setEditable(true);

// task
function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;

    const li = document.createElement('li');
    li.className = 'task-item flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check w-4 h-4 cursor-pointer flex-shrink-0';
    checkbox.onchange = function () { li.classList.toggle('done', checkbox.checked); };

    const span = document.createElement('span');
    span.className = 'task-text flex-1 text-sm';
    span.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete px-2 py-1 text-xs text-white rounded cursor-pointer border-0 flex-shrink-0';
    deleteBtn.style.background = '#b06ee8';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function () { li.remove(); };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    document.getElementById('taskList').appendChild(li);
    input.value = '';
    input.focus();
}

document.getElementById('taskInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
});

// link
function createLinkCard(name, url) {
    const card = document.createElement('div');
    card.className = 'link-card relative inline-flex items-center justify-center cursor-pointer';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'link-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Hapus link';
    deleteBtn.onclick = function (e) { e.stopPropagation(); card.remove(); };

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

createLinkCard('Google', 'https://www.google.com');
createLinkCard('Gmail', 'https://mail.google.com');
createLinkCard('Calendar', 'https://calendar.google.com');

function addLink() {
    const nameInput = document.getElementById('linkName');
    const urlInput = document.getElementById('linkUrl');
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    createLinkCard(name, url);
    nameInput.value = '';
    urlInput.value = '';
    nameInput.focus();
}
