/**
 * index.js
 * Full Node/Express server for Roblox queue.
 * - GET    /           : Root route to avoid 404
 * - POST   /joinQueue  : Accepts JSON from Roblox, adds player to an in-memory queue
 * - GET    /listQueue  : Returns the current queue (for debugging)
 */

const express = require('express');
const cors = require('cors');
const app = express();

// 1. Middleware to parse JSON bodies
app.use(express.json());

// 2. CORS Configuration
app.use(cors({
  origin: '*', // Allow all origins. For more security, specify your Roblox game's domain.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 3. In-memory queue (use a database like Redis or PostgreSQL for production)
let queue = [];

// ============ Root Route (GET /) ============
app.get('/', (req, res) => {
  res.json({ message: 'Roblox Queue Server is operational.' });
});

// ============ POST /joinQueue ============
app.post('/joinQueue', (req, res) => {
  const { userId, playerName } = req.body;

  // Validate request body
  if (!userId || !playerName) {
    return res.status(400).json({
      success: false,
      message: 'Missing userId or playerName in request body.'
    });
  }

  // Check if player is already in the queue
  const exists = queue.find(player => player.userId === userId);
  if (exists) {
    return res.status(409).json({
      success: false,
      message: `Player ${playerName} is already in the queue.`
    });
  }

  // Add player to the queue
  queue.push({ userId, playerName });
  console.log(`Player joined queue: ${playerName} (${userId})`);

  return res.status(200).json({
    success: true,
    message: `Player ${playerName} (${userId}) joined the queue!`,
    queueSize: queue.length
  });
});

// ============ GET /listQueue ============
app.get('/listQueue', (req, res) => {
  return res.status(200).json({
    success: true,
    queue
  });
});

// ============ Start Server on Heroku's Port ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Roblox Queue Server running on port ${PORT}`);
});
