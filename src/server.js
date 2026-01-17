const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pino = require('pino-http');

dotenv.config();

const app = express();
const logger = pino();

const PORT = process.env.PORT || 3000;

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());
app.use(logger);

/* ---------- Routes ---------- */

// GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// GET /test-error
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

/* ---------- 404 Middleware ---------- */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

/* ---------- Error Middleware (500) ---------- */
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
  });
});

/* ---------- Server ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
