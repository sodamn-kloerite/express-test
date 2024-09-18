const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3005;

// File to store unique IP addresses
const statsFile = 'stats.json';

// Serve static files from the current directory
app.use(express.static(__dirname));

// Function to read stats from file
function readStats() {
  try {
    return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  } catch (error) {
    return [];
  }
}

// Function to write stats to file
function writeStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
}

// Function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Serve image
app.get('/image', (req, res) => {
  const clientIP = getClientIP(req);
  console.log(`Image requested by IP: ${clientIP}`);  // Log every IP request

  const stats = readStats();
  
  if (!stats.includes(clientIP)) {
    stats.push(clientIP);
    writeStats(stats);
    console.log(`New unique IP added: ${clientIP}`);  // Log when a new IP is added
  }

  res.sendFile(path.join(__dirname, 'swvl_logo.png'));
});

// Get stats
app.get('/stats', (req, res) => {
  const stats = readStats();
  res.json({ uniqueIPCount: stats.length });
});

// Reset stats
app.post('/reset', (req, res) => {
  writeStats([]);
  res.json({ message: 'Stats reset successfully' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});