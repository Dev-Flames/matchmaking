/**
 * index.js
 * Minimal Node/Express server for a Roblox queue system.
 * 
 * - /joinQueue (POST) : Add player to an in-memory queue
 * - /listQueue (GET)  : View current queue
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());  // Parse JSON bodies
app.use(cors());          // Allow cross-origin (including from Roblox)

// In-memory queue array (for demo). In production, use a database!
let queue = [];

// ========== 1) POST /joinQueue ==========
// Roblox sends { userId, playerName } to join the queue
app.post('/joinQueue', (req, res) => {
  const { userId, playerName } = req.body;

  // Basic validation
  if (!userId || !playerName) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing userId or playerName in request body." 
    });
  }

  // Check if player is already in the queue
  const alreadyInQueue = queue.find(p => p.userId === userId);
  if (alreadyInQueue) {
    return res.json({
      success: false,
      message: `Player ${playerName} is already in the queue.`
    });
  }

  // Add to queue
  queue.push({ userId, playerName });
  console.log(`Player joined queue: ${playerName} (${userId})`);

  return res.json({
    success: true,
    message: `Player ${playerName} (${userId}) joined the queue!`,
    queueSize: queue.length
  });
});

// ========== 2) GET /listQueue ==========
// Quick endpoint to see who is in the queue (for debugging)
app.get('/listQueue', (req, res) => {
  return res.json({
    success: true,
    queue
  });
});

// ========== Start Server on Heroku's Port ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Roblox Queue Server running on port ${PORT}`);
});
