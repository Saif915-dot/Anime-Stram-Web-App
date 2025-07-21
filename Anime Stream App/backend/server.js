const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend (index.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

const animePath = path.join(__dirname, 'data', 'anime.json');
const episodesPath = path.join(__dirname, 'data', 'episodes.json');

// Serve static files for covers, videos, and subtitles
app.use('/covers', express.static(path.join(__dirname, 'covers')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/subs', express.static(path.join(__dirname, 'subs')));

// Simple admin password for protected routes
const ADMIN_PASSWORD = 'SaifisRock@AE89';

// Helper: check admin password from header or body
function isAdmin(req) {
  return (
    req.headers['x-admin-password'] === ADMIN_PASSWORD ||
    req.body?.adminPassword === ADMIN_PASSWORD
  );
}

// Add new anime (admin only)
app.post('/api/anime', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { title, cover, description, genres, year } = req.body;
  if (!title || !cover || !description || !genres || !year) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  fs.readFile(animePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read anime data.' });
    const animeList = JSON.parse(data);
    const newAnime = {
      id: (Date.now()).toString(),
      title, cover, description, genres, year
    };
    animeList.push(newAnime);
    fs.writeFile(animePath, JSON.stringify(animeList, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Failed to save anime.' });
      res.json(newAnime);
    });
  });
});

// Delete anime (admin only)
app.delete('/api/anime/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  fs.readFile(animePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read anime data.' });
    let animeList = JSON.parse(data);
    const idx = animeList.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Anime not found.' });
    const [deleted] = animeList.splice(idx, 1);
    fs.writeFile(animePath, JSON.stringify(animeList, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Failed to delete anime.' });
      res.json({ success: true, deleted });
    });
  });
});

// Get all anime
app.get('/api/anime', (req, res) => {
  fs.readFile(animePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read anime data.' });
    res.json(JSON.parse(data));
  });
});

// Get anime by ID
app.get('/api/anime/:id', (req, res) => {
  fs.readFile(animePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read anime data.' });
    const anime = JSON.parse(data).find(a => a.id === req.params.id);
    if (!anime) return res.status(404).json({ error: 'Anime not found.' });
    res.json(anime);
  });
});

// Get episodes for an anime
app.get('/api/anime/:id/episodes', (req, res) => {
  fs.readFile(episodesPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read episodes data.' });
    const episodes = JSON.parse(data).filter(e => e.animeId === req.params.id);
    res.json(episodes);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 