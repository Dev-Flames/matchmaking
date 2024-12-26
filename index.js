/**
 * index.js
 * Full Node/Express server for Roblox queue.
 * - GET  /          -> Simple root route to avoid 404
 * - POST /joinQueue -> Accepts JSON from Roblox, adds player to an in-memory queue
 */

const express = require('express');
const cors = require('cors');
const app = express();

// 1) Parse JSON body
app.use(express.json());

// 2) Allow CORS + custom headers (Content-Type, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// In-memory queue for demo (not persisted)
let queue = [];

// ============ Root Route (GET /) ============
app.get('/', (req, res) => {
  res.send('Hello from the Roblox Queue Server root!'); 
  // or res.json({ message: 'Root route working!' });
});

// ============ POST /joinQueue ============
app.post('/joinQueue', (req, res) => {
  const { userId, playerName } = req.body;

  // Basic validation
  if (!userId || !playerName) {
    return res.status(400).json({
      success: false,
      message: 'Missing userId or playerName in request body.'
    });
  }

  // Check if already in queue
  const exists = queue.find(p => p.userId === userId);
  if (exists) {
    return res.json({
      success: false,
      message: `Player ${playerName} is already in the queue.`
    });
  }

  // Add the player to the queue
  queue.push({ userId, playerName });
  console.log(`Player joined queue: ${playerName} (${userId})`);

  return res.json({
    success: true,
    message: `Player ${playerName} (${userId}) joined the queue!`,
    queueSize: queue.length
  });
});

// ============ Listen on Heroku's Port or localhost 3000 ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Roblox Queue Server running on port ${PORT}`);
});
