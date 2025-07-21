const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');
const API_BASE = '/api';

const seriesTitle = document.getElementById('series-title');
const detailsDiv = document.getElementById('anime-details');
const episodesDiv = document.getElementById('episodes');
const playerContainer = document.getElementById('player-container');
const videoPlayer = document.getElementById('video-player');
const subtitleTrack = document.getElementById('subtitle-track');
const episodeTitle = document.getElementById('episode-title');

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

// --- Watched Genres Tracking ---
function addWatchedGenres(genres) {
  const prev = JSON.parse(localStorage.getItem('watchedGenres') || '[]');
  const updated = Array.from(new Set([...prev, ...genres]));
  localStorage.setItem('watchedGenres', JSON.stringify(updated));
}

function renderDetails(anime) {
  seriesTitle.textContent = anime.title;
  detailsDiv.innerHTML = `
    <img src="${anime.cover}" alt="${anime.title}" class="w-32 h-44 object-cover rounded shadow">
    <div>
      <h2 class="text-2xl font-bold mb-2">${anime.title} <span class="text-gray-500 text-base">(${anime.year})</span></h2>
      <div class="mb-2 text-sm text-gray-600">${anime.genres.join(', ')}</div>
      <p class="text-gray-700">${anime.description}</p>
    </div>
  `;
}

// --- Loading Spinner for Episodes ---
function showSpinner(target) {
  target.innerHTML = '<div class="flex justify-center items-center"><svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></div>';
}

function renderEpisodes(episodes) {
  episodesDiv.innerHTML = '<h3 class="font-semibold mb-2">Episodes</h3>';
  const list = document.createElement('div');
  list.className = 'flex flex-wrap gap-2';
  episodes.forEach(ep => {
    const btn = document.createElement('button');
    btn.className = 'bg-white border rounded px-3 py-1 shadow hover:bg-blue-100';
    btn.textContent = ep.title;
    btn.setAttribute('aria-label', `Play episode: ${ep.title}`);
    btn.onclick = () => playEpisode(ep);
    list.appendChild(btn);
  });
  episodesDiv.appendChild(list);
}

function playEpisode(ep) {
  videoPlayer.src = ep.videoUrl;
  subtitleTrack.src = ep.subtitlesUrl;
  episodeTitle.textContent = ep.title;
  playerContainer.classList.remove('hidden');
  videoPlayer.load();
  videoPlayer.play();
  // Track watched genres
  if (window.currentAnimeGenres) addWatchedGenres(window.currentAnimeGenres);
}

// --- Fetch and Render ---
showSpinner(episodesDiv);
Promise.all([
  fetch(`${API_BASE}/anime/${animeId}`).then(r => r.json()),
  fetch(`${API_BASE}/anime/${animeId}/episodes`).then(r => r.json())
]).then(([anime, episodes]) => {
  window.currentAnimeGenres = anime.genres;
  renderDetails(anime);
  renderEpisodes(episodes);
}); 