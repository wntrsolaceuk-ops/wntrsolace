// Main WinterSolace server
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'layout-winter-frost.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/order-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'order-details.html'));
});


// Start server
app.listen(PORT, () => {
    console.log(`WinterSolace website running on http://localhost:${PORT}`);
});

module.exports = app;

