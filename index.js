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

// POST /queue/add Route
app.post('/queue/add', (req, res) => {
  const { userId, name } = req.body;

  // Validate request body
  if (!userId || !name) {
    return res.status(400).json({
      success: false,
      message: 'Missing userId or name in request body.'
    });
  }

  // Check if player is already in the queue
  const existingPlayer = queue.find(player => player.userId === userId);
  if (existingPlayer) {
    return res.status(409).json({
      success: false,
      message: `Player ${name} is already in the queue.`
    });
  }

  // Add player to the queue
  queue.push({ userId, name });
  console.log(`Player joined queue: ${name} (${userId})`);

  return res.status(200).json({
    success: true,
    message: `Player ${name} (${userId}) joined the queue!`,
    queueSize: queue.length
  });
});

// POST /queue/remove Route
app.post('/queue/remove', (req, res) => {
  const { userId } = req.body;

  // Validate request body
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Missing userId in request body.'
    });
  }

  // Find the player in the queue
  const playerIndex = queue.findIndex(player => player.userId === userId);
  if (playerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Player with userId ${userId} is not in the queue.`
    });
  }

  // Remove the player from the queue
  const removedPlayer = queue.splice(playerIndex, 1)[0];
  console.log(`Player removed from queue: ${removedPlayer.name} (${removedPlayer.userId})`);

  return res.status(200).json({
    success: true,
    message: `Player ${removedPlayer.name} (${removedPlayer.userId}) removed from the queue.`,
    queueSize: queue.length
  });
});

// POST /queue/assign Route
app.post('/queue/assign', (req, res) => {
  const { count } = req.body;

  // Validate request body
  if (typeof count !== 'number' || count <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid count value.'
    });
  }

  // Assign players from the queue
  const assignedPlayers = queue.slice(0, count).map(player => player.userId);
  queue = queue.slice(count);

  console.log(`Assigned players: ${assignedPlayers.join(', ')}`);
  console.log(`Current queue size: ${queue.length}`);

  return res.status(200).json({
    success: true,
    assignedPlayers,
    queueSize: queue.length
  });
});

// POST /match/end Route (Optional)
app.post('/match/end', (req, res) => {
  const { serverId } = req.body;

  // Validate request body
  if (!serverId) {
    return res.status(400).json({
      success: false,
      message: 'Missing serverId in request body.'
    });
  }

  // Handle match end logic here (e.g., logging, updating database)
  console.log(`Match ended for serverId: ${serverId}`);

  return res.status(200).json({
    success: true,
    message: `Match ended for serverId: ${serverId}.`
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
