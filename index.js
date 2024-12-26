const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// In-memory queue for demonstration.
// For production, you likely want a real database.
let queue = [];

// Middleware to parse JSON in requests
app.use(bodyParser.json());

// Endpoint to add a player to the queue
app.post('/joinQueue', (req, res) => {
  const { userId } = req.body; 
  if (!userId) {
    return res.status(400).send({ error: 'userId is required' });
  }

  // Check if user already in queue
  if (!queue.includes(userId)) {
    queue.push(userId);
  }

  console.log(`User ${userId} joined the queue.`);
  return res.status(200).send({ message: 'Joined queue successfully' });
});

// Endpoint to get the current queue (for debugging or verification)
app.get('/queue', (req, res) => {
  res.status(200).send({ queue });
});

// Endpoint to pop a group of players from the queue
// For example, if you want to group them in sets of 4
app.post('/matchmake', (req, res) => {
  const { groupSize } = req.body;
  if (!groupSize) {
    return res.status(400).send({ error: 'groupSize is required' });
  }

  // Check if we have enough players
  if (queue.length >= groupSize) {
    // Extract the first `groupSize` players
    const matchedPlayers = queue.splice(0, groupSize);
    console.log(`Matched players: ${matchedPlayers}`);
    return res.status(200).send({ matchedPlayers });
  } else {
    return res.status(200).send({ matchedPlayers: [] });
  }
});

app.listen(port, () => {
  console.log(`Matchmaking server running on port ${port}`);
});
