// index.js
/**
 * Node.js server for Roblox matchmaking queue
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: '*', // Allow all origins. For enhanced security, specify your Roblox game's domain.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// In-memory queue (for demonstration purposes)
// For production, consider using a persistent database like Redis or PostgreSQL
let queue = [];

// Root Route to prevent "Cannot GET /" error
app.get('/', (req, res) => {
  res.json({ message: 'Roblox Queue Server is operational.' });
});

// POST /joinQueue Route
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
  const existingPlayer = queue.find(player => player.userId === userId);
  if (existingPlayer) {
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

// GET /listQueue Route (for debugging)
app.get('/listQueue', (req, res) => {
  res.json({
    success: true,
    queue
  });
});

// Start the server on Heroku's assigned port or localhost:3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Roblox Queue Server running on port ${PORT}`);
});
