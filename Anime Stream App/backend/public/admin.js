// --- Admin Panel Logic ---
const API_URL = '/api/anime';
const ADMIN_PASSWORD = 'SaifisRock@AE89';

const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const uploadForm = document.getElementById('upload-form');
const animeGrid = document.getElementById('admin-anime-grid');
const themeToggle = document.getElementById('theme-toggle');

// --- Admin Session ---
function isAdmin() {
  return sessionStorage.getItem('isAdmin') === 'true';
}
function setAdmin(val) {
  sessionStorage.setItem('isAdmin', val ? 'true' : 'false');
}

// --- Password Modal ---
function showModal() { passwordModal.classList.remove('hidden'); }
function hideModal() { passwordModal.classList.add('hidden'); }

if (!isAdmin()) showModal();
loginBtn.onclick = () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    setAdmin(true);
    hideModal();
    loadAnime();
  } else {
    loginError.classList.remove('hidden');
  }
};

// --- Theme Logic ---
function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}
function initThemeToggle() {
  themeToggle.setAttribute('aria-label', 'Toggle light/dark theme');
  themeToggle.onclick = () => {
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(newTheme);
  };
  if (localStorage.getItem('theme') === 'dark') setTheme('dark');
}
initThemeToggle();

// --- Toast Feedback ---
function showToast(msg, success = true) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50 text-white text-center';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = success ? '#16a34a' : '#dc2626';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

// --- Logout Button ---
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Logout';
logoutBtn.className = 'ml-2 px-3 py-1 rounded bg-red-200 text-red-800';
logoutBtn.setAttribute('aria-label', 'Logout admin session');
document.querySelector('header').appendChild(logoutBtn);
logoutBtn.onclick = () => {
  setAdmin(false);
  location.reload();
};

// --- Confirmation Modal ---
function showConfirm(msg, onConfirm) {
  let modal = document.getElementById('confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    modal.innerHTML = `<div class="bg-white p-6 rounded shadow max-w-xs w-full text-center">
      <div class="mb-4">${msg}</div>
      <button id="confirm-yes" class="bg-blue-600 text-white rounded px-3 py-2 mr-2">Yes</button>
      <button id="confirm-no" class="bg-gray-300 rounded px-3 py-2">No</button>
    </div>`;
    document.body.appendChild(modal);
  } else {
    modal.querySelector('div').firstChild.textContent = msg;
    modal.style.display = 'flex';
  }
  modal.querySelector('#confirm-yes').onclick = () => { modal.style.display = 'none'; onConfirm(); };
  modal.querySelector('#confirm-no').onclick = () => { modal.style.display = 'none'; };
}

// --- Loading Spinner ---
function showSpinner(target) {
  target.innerHTML = '<div class="col-span-full flex justify-center items-center"><svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></div>';
}

// --- Password Modal ---
if (!isAdmin()) showModal();
loginBtn.onclick = () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    setAdmin(true);
    hideModal();
    loadAnime();
  } else {
    loginError.classList.remove('hidden');
  }
};

// --- Upload Form ---
uploadForm.onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(uploadForm);
  const data = {
    title: form.get('title'),
    cover: form.get('cover'),
    description: form.get('description'),
    genres: form.get('genres').split(',').map(g => g.trim()),
    year: Number(form.get('year')),
    adminPassword: ADMIN_PASSWORD
  };
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    uploadForm.reset();
    showToast('Anime uploaded!', true);
    loadAnime();
  } else {
    showToast('Failed to upload anime.', false);
  }
};

// --- Load and Render Anime ---
async function loadAnime() {
  showSpinner(animeGrid);
  const res = await fetch(API_URL);
  const animeList = await res.json();
  renderAnimeGrid(animeList);
}
function renderAnimeGrid(list) {
  animeGrid.innerHTML = '';
  list.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow p-2 flex flex-col items-center relative';
    card.innerHTML = `
      <img src="${anime.cover}" alt="${anime.title}" class="w-full h-32 object-cover rounded mb-2">
      <div class="font-semibold text-center">${anime.title}</div>
      <button class="delete-btn absolute top-1 right-1 text-red-500 hover:text-red-700" title="Delete" aria-label="Delete ${anime.title}" data-id="${anime.id}">&times;</button>
    `;
    animeGrid.appendChild(card);
  });
  // Attach delete handlers
  animeGrid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute('data-id');
      showConfirm('Delete this anime?', async () => {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD }
        });
        if (res.ok) {
          showToast('Anime deleted!', true);
          loadAnime();
        } else {
          showToast('Failed to delete anime.', false);
        }
      });
    };
  });
}

if (isAdmin()) loadAnime(); 