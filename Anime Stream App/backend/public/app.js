// --- Theme Logic ---
function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}
function initThemeToggle() {
  const themeBtn = document.createElement('button');
  themeBtn.textContent = 'Toggle Theme';
  themeBtn.className = 'ml-4 px-3 py-1 rounded bg-gray-200';
  themeBtn.setAttribute('aria-label', 'Toggle light/dark theme');
  document.querySelector('header').appendChild(themeBtn);
  themeBtn.onclick = () => {
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

// --- Loading Spinner ---
function showSpinner(target) {
  target.innerHTML = '<div class="col-span-full flex justify-center items-center"><svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></div>';
}

// --- Recommendations ---
const recSection = document.createElement('section');
recSection.innerHTML = '<h2 class="font-semibold text-xl mb-2">Recommended for You</h2><div id="rec-grid" class="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6"></div>';
document.querySelector('main').prepend(recSection);
const recGrid = document.getElementById('rec-grid');

function getWatchedGenres() {
  return JSON.parse(localStorage.getItem('watchedGenres') || '[]');
}
function addWatchedGenres(genres) {
  const prev = getWatchedGenres();
  const updated = Array.from(new Set([...prev, ...genres]));
  localStorage.setItem('watchedGenres', JSON.stringify(updated));
}
function getRecommendations(animeList) {
  const liked = getWatchedGenres();
  if (!liked.length) return [];
  return animeList.filter(a => a.genres.some(g => liked.includes(g)));
}
function renderRecommendations(list) {
  recGrid.innerHTML = '';
  if (list.length === 0) {
    recGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">No recommendations yet.</div>';
    return;
  }
  list.forEach(anime => {
    const card = document.createElement('a');
    card.href = `series.html?id=${anime.id}`;
    card.className = 'bg-white rounded shadow hover:shadow-lg transition block overflow-hidden';
    card.innerHTML = `
      <img src="${anime.cover}" alt="${anime.title}" class="w-full h-40 object-cover">
      <div class="p-2">
        <h2 class="font-semibold text-lg truncate">${anime.title}</h2>
        <p class="text-xs text-gray-500">${anime.year}</p>
      </div>
    `;
    recGrid.appendChild(card);
  });
}

// --- Main Grid ---
const API_URL = '/api/anime';
const grid = document.getElementById('anime-grid');
const searchInput = document.getElementById('search');
let animeList = [];

function renderAnime(list) {
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center text-gray-500">No anime found.</div>';
    return;
  }
  list.forEach(anime => {
    const card = document.createElement('a');
    card.href = `series.html?id=${anime.id}`;
    card.className = 'bg-white rounded shadow hover:shadow-lg transition block overflow-hidden';
    card.setAttribute('aria-label', `View details for ${anime.title}`);
    card.innerHTML = `
      <img src="${anime.cover}" alt="${anime.title}" class="w-full h-40 object-cover">
      <div class="p-2">
        <h2 class="font-semibold text-lg truncate">${anime.title}</h2>
        <p class="text-xs text-gray-500">${anime.year}</p>
      </div>
    `;
    card.onclick = () => addWatchedGenres(anime.genres);
    grid.appendChild(card);
  });
}

function filterAnime() {
  const q = searchInput.value.toLowerCase();
  renderAnime(animeList.filter(a => a.title.toLowerCase().includes(q)));
}

showSpinner(grid);
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    animeList = data;
    renderAnime(animeList);
    renderRecommendations(getRecommendations(animeList));
  });

searchInput.addEventListener('input', filterAnime); 