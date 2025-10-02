// TrackingMore Server-Side Proxy
// Final attempt with different approach

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// TrackingMore API configuration
const TRACKINGMORE_API_KEY = 'y4kelodr-o6yl-e352-c19u-8zxx20lfki5t';
const TRACKINGMORE_BASE_URL = 'https://api.trackingmore.com/v4';

// Proxy endpoint for tracking
app.post('/api/track', async (req, res) => {
    try {
        const { trackingNumber, carrier } = req.body;
        
        console.log('Tracking request:', { trackingNumber, carrier });
        
        // Try without specifying carrier - let TrackingMore auto-detect
        const createResponse = await fetch(`${TRACKINGMORE_BASE_URL}/trackings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Tracking-Api-Key': TRACKINGMORE_API_KEY
            },
            body: JSON.stringify({
                tracking_number: trackingNumber
                // No courier_code - let it auto-detect
            })
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error(`TrackingMore create error: ${createResponse.status} - ${errorText}`);
            throw new Error(`TrackingMore API error: ${createResponse.status} - ${errorText}`);
        }
        
        const createData = await createResponse.json();
        console.log('TrackingMore create response (no carrier):', createData);
        
        // If we got data, return it
        if (createData.data && createData.data.length > 0) {
            console.log('Got tracking data!');
            res.json(createData);
            return;
        }
        
        // Try with hermes-uk specifically
        console.log('Trying with hermes-uk...');
        const hermesResponse = await fetch(`${TRACKINGMORE_BASE_URL}/trackings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Tracking-Api-Key': TRACKINGMORE_API_KEY
            },
            body: JSON.stringify({
                tracking_number: trackingNumber,
                courier_code: 'hermes-uk'
            })
        });
        
        if (hermesResponse.ok) {
            const hermesData = await hermesResponse.json();
            console.log('TrackingMore hermes response:', hermesData);
            
            if (hermesData.data && hermesData.data.length > 0) {
                console.log('Got tracking data with hermes-uk!');
                res.json(hermesData);
                return;
            }
        }
        
        // Last resort - return the original create response
        console.log('No data found, returning empty response');
        res.json(createData);
        
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tracking data',
            message: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Tracking server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Tracking server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;