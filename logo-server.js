const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3005;

// Serve static files from current directory
app.use(express.static('.'));

// Specific route for WinterSolace logo
app.get('/logo', (req, res) => {
    const logoPath = path.join(__dirname, 'Wntrsolacewhite.png');
    
    if (fs.existsSync(logoPath)) {
        res.sendFile(logoPath);
    } else {
        res.status(404).send('Logo not found');
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Logo server running' });
});

app.listen(PORT, () => {
    console.log(`🖼️  Logo server running on port ${PORT}`);
    console.log(`🔗 Logo URL: http://localhost:${PORT}/logo`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

