import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount REST API
app.use('/api', apiRoutes);

// Serve the workstation shop routes again.
app.get(['/builds', '/build'], (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'builds.html'));
});

// Serve static web application assets (HTML, CSS, JS, Images, Data)
app.use(express.static(ROOT_DIR));

// Page routes
app.get('/coming-soon', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'coming-soon.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'dashboard.html'));
});

app.get('/exploits', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'projects.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AMBURSA PC Builds & Research Server Running `);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Custom PC Builds Shop: http://localhost:${PORT}/builds.html`);
  console.log(` Owner Inventory Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`====================================================`);
});
