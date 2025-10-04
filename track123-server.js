// Track123 Server-Side Proxy
// Based on Track123 API documentation

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Track123 API configuration
const TRACK123_API_KEY = process.env.TRACK123_API_KEY || '32fe8c7f7fcc4b0daab974bfc06b5415';
const TRACK123_BASE_URL = 'https://api.track123.com/gateway/open-api/tk/v2';

// Evri API configuration (if we want to call Evri directly)
const EVRI_API_BASE_URL = 'https://api.evri.com';

// Royal Mail API configuration
const ROYAL_MAIL_API_BASE_URL = 'https://api.royalmail.net';

// Cache configuration - 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const trackingCache = new Map(); // In-memory cache for tracking data

// Cache helper functions
function getCacheKey(trackingNumber, carrier) {
    return `${trackingNumber}_${carrier || 'auto'}`;
}

function getCachedData(trackingNumber, carrier) {
    const cacheKey = getCacheKey(trackingNumber, carrier);
    const cached = trackingCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`Cache HIT for ${trackingNumber} (${Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60))} hours old)`);
        return cached.data;
    }
    
    console.log(`Cache MISS for ${trackingNumber}`);
    return null;
}

function setCachedData(trackingNumber, carrier, data) {
    const cacheKey = getCacheKey(trackingNumber, carrier);
    trackingCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
    });
    console.log(`Cached data for ${trackingNumber}`);
}

// Register tracking endpoint
app.post('/api/register-tracking', async (req, res) => {
    try {
        const { trackingNumber, carrier } = req.body;
        
        console.log('Registering tracking:', { trackingNumber, carrier });
        
        const registerResponse = await fetch(`${TRACK123_BASE_URL}/track/import`, {
            method: 'POST',
            headers: {
                'Track123-Api-Secret': TRACK123_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify([{
                trackNo: trackingNumber,
                courierCode: carrier || undefined // Let Track123 auto-detect if no carrier
            }])
        });
        
        if (!registerResponse.ok) {
            const errorText = await registerResponse.text();
            console.error(`Track123 register error: ${registerResponse.status} - ${errorText}`);
            throw new Error(`Track123 API error: ${registerResponse.status} - ${errorText}`);
        }
        
        const registerData = await registerResponse.json();
        console.log('Track123 register response:', registerData);
        
        res.json(registerData);
        
    } catch (error) {
        console.error('Register tracking error:', error);
        res.status(500).json({ 
            error: 'Failed to register tracking',
            message: error.message 
        });
    }
});

// Query tracking endpoint
app.post('/api/query-tracking', async (req, res) => {
    try {
        const { trackingNumbers } = req.body;
        
        console.log('Querying tracking:', { trackingNumbers });
        
        const queryResponse = await fetch(`${TRACK123_BASE_URL}/track/query`, {
            method: 'POST',
            headers: {
                'Track123-Api-Secret': TRACK123_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                trackNos: Array.isArray(trackingNumbers) ? trackingNumbers : [trackingNumbers]
            })
        });
        
        if (!queryResponse.ok) {
            const errorText = await queryResponse.text();
            console.error(`Track123 query error: ${queryResponse.status} - ${errorText}`);
            throw new Error(`Track123 API error: ${queryResponse.status} - ${errorText}`);
        }
        
        const queryData = await queryResponse.json();
        console.log('Track123 query response:', queryData);
        
        res.json(queryData);
        
    } catch (error) {
        console.error('Query tracking error:', error);
        res.status(500).json({ 
            error: 'Failed to query tracking',
            message: error.message 
        });
    }
});

// Combined endpoint (register + query) with 24-hour caching
app.post('/api/track', async (req, res) => {
    try {
        const { trackingNumber, carrier } = req.body;
        
        console.log('Combined tracking request:', { trackingNumber, carrier });
        
        // Check cache first
        const cachedData = getCachedData(trackingNumber, carrier);
        if (cachedData) {
            console.log('Returning cached data');
            res.json(cachedData);
            return;
        }
        
        console.log('Cache miss - making API calls to Track123');
        
        // Step 1: Register the tracking
        const registerResponse = await fetch(`${TRACK123_BASE_URL}/track/import`, {
            method: 'POST',
            headers: {
                'Track123-Api-Secret': TRACK123_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify([{
                trackNo: trackingNumber,
                courierCode: carrier || undefined
            }])
        });
        
        if (!registerResponse.ok) {
            const errorText = await registerResponse.text();
            console.error(`Track123 register error: ${registerResponse.status} - ${errorText}`);
            throw new Error(`Track123 API error: ${registerResponse.status} - ${errorText}`);
        }
        
        const registerData = await registerResponse.json();
        console.log('Track123 register response:', registerData);
        
        // Step 2: Query for tracking data
        const queryResponse = await fetch(`${TRACK123_BASE_URL}/track/query`, {
            method: 'POST',
            headers: {
                'Track123-Api-Secret': TRACK123_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                trackNos: [trackingNumber]
            })
        });
        
        if (!queryResponse.ok) {
            const errorText = await queryResponse.text();
            console.error(`Track123 query error: ${queryResponse.status} - ${errorText}`);
            throw new Error(`Track123 API error: ${queryResponse.status} - ${errorText}`);
        }
        
        const queryData = await queryResponse.json();
        console.log('Track123 query response:', queryData);
        
        // Cache the result for 24 hours
        setCachedData(trackingNumber, carrier, queryData);
        
        res.json(queryData);
        
    } catch (error) {
        console.error('Combined tracking error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tracking data',
            message: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Track123 server is running' });
});

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
    const stats = {
        totalCached: trackingCache.size,
        cacheDuration: '24 hours',
        cachedItems: Array.from(trackingCache.keys()).map(key => {
            const cached = trackingCache.get(key);
            const ageHours = Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60));
            return {
                key: key,
                ageHours: ageHours,
                expiresInHours: 24 - ageHours
            };
        })
    };
    res.json(stats);
});

app.delete('/api/cache/clear', (req, res) => {
    const clearedCount = trackingCache.size;
    trackingCache.clear();
    res.json({ 
        message: `Cleared ${clearedCount} cached items`,
        clearedCount: clearedCount
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Track123 server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Cache stats: http://localhost:${PORT}/api/cache/stats`);
    console.log(`\n✅ 24-HOUR CACHING ENABLED`);
    console.log(`📊 Tracking data cached for 24 hours to reduce API calls`);
    console.log(`🔄 Cache automatically expires and refreshes daily`);
    console.log(`\nAvailable endpoints:`);
    console.log(`- POST /api/track (with 24h caching)`);
    console.log(`- GET /api/cache/stats (view cache status)`);
    console.log(`- DELETE /api/cache/clear (clear all cache)`);
});

module.exports = app;
