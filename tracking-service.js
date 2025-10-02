// TrackingMore API Integration
// Free tier: 50 shipments/month
// 1,200+ carriers supported

class TrackingMoreTracker {
    constructor() {
        this.apiKey = 'YOUR_TRACKINGMORE_API_KEY'; // You'll need to get this
        this.baseUrl = 'https://api.trackingmore.com/v2';
        this.cache = new Map(); // Cache to reduce API calls
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours cache
    }

    // Set API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // Get tracking information
    async getTrackingInfo(trackingNumber, carrier = null) {
        try {
            // Check cache first
            const cacheKey = `${trackingNumber}_${carrier || 'auto'}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('Using cached tracking data (24h cache)');
                return cached.data;
            }

            // Make API request to our server-side proxy
            const response = await fetch('http://localhost:3001/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trackingNumber: trackingNumber,
                    carrier: carrier || 'auto'
                })
            });

            if (!response.ok) {
                throw new Error(`TrackingMore API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error('TrackingMore API error:', error);
            throw error;
        }
    }

    // Get supported carriers
    async getSupportedCarriers() {
        try {
            const response = await fetch(`${this.baseUrl}/carriers`, {
                headers: {
                    'Tracking-Api-Key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`TrackingMore API request failed: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error fetching carriers:', error);
            throw error;
        }
    }

    // Format tracking data for display
    formatTrackingData(trackingData) {
        console.log('Raw TrackingMore response:', trackingData);
        
        // Handle different response structures
        if (!trackingData) {
            return {
                status: 'unknown',
                events: [],
                carrier: 'Unknown',
                estimatedDelivery: null
            };
        }

        // Check if it's a successful response
        if (trackingData.meta && trackingData.meta.code !== 200) {
            console.error('TrackingMore API error:', trackingData.meta.message);
            return {
                status: 'error',
                events: [],
                carrier: 'Unknown',
                estimatedDelivery: null
            };
        }

        // Check if data array is empty (tracking not found)
        if (!trackingData.data || (Array.isArray(trackingData.data) && trackingData.data.length === 0) || (typeof trackingData.data === 'object' && Object.keys(trackingData.data).length === 0)) {
            console.log('No tracking data found - tracking number may not exist in TrackingMore database');
            return {
                status: 'not_found',
                events: [],
                carrier: 'Unknown',
                estimatedDelivery: null
            };
        }

        // Get the first tracking result
        const tracking = trackingData.data[0];
        console.log('Tracking object:', tracking);
        const trackingInfo = tracking?.origin_info?.trackinfo || [];
        console.log('Tracking info array:', trackingInfo);
        console.log('Tracking info length:', trackingInfo.length);
        
        // Handle case where tracking exists but no events yet
        if (trackingInfo.length === 0) {
            console.log('Tracking number found but no events yet - package may not be scanned yet');
            return {
                status: tracking?.delivery_status || 'pending',
                events: [{
                    title: 'Tracking Created',
                    description: 'Tracking number has been created and is waiting for first scan',
                    date: new Date(tracking?.created_at).toLocaleString(),
                    location: '',
                    status: 'pending'
                }],
                carrier: tracking?.courier_code || 'Unknown',
                estimatedDelivery: tracking?.scheduled_delivery_date || null,
                trackingNumber: tracking?.tracking_number
            };
        }

        const events = trackingInfo.map(event => ({
            title: event.raw_status || event.checkpoint_delivery_status || 'Update',
            description: event.tracking_detail || event.description || 'Package update',
            date: new Date(event.checkpoint_date || event.date || event.datetime).toLocaleString(),
            location: event.location || event.city || '',
            status: event.checkpoint_delivery_status || event.status || 'in_transit'
        }));

        return {
            status: tracking?.delivery_status || tracking?.status || 'in_transit',
            events: events,
            carrier: tracking?.courier_code || 'Unknown',
            estimatedDelivery: tracking?.scheduled_delivery_date || null,
            trackingNumber: tracking?.tracking_number
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Global instance
window.trackingMoreTracker = new TrackingMoreTracker();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrackingMoreTracker;
}
