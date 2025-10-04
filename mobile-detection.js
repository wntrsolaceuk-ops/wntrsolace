// Mobile Detection and Redirect Logic
// This script detects mobile devices and redirects to mobile-optimized pages

(function() {
    'use strict';

    // Mobile detection function
    function isMobileDevice() {
        // Check user agent for mobile devices
        const mobileUserAgents = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i,
            /Mobile/i,
            /Tablet/i
        ];

        const userAgent = navigator.userAgent;
        const isMobileUA = mobileUserAgents.some(agent => agent.test(userAgent));

        // Check screen size (additional check for tablets/desktops with mobile viewport)
        const isMobileScreen = window.innerWidth <= 768;

        // Check touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Check if user is already on a mobile page
        const isAlreadyOnMobile = window.location.pathname.includes('-mobile.html');

        // Debug logging
        console.log('Mobile Detection Debug:', {
            userAgent: userAgent,
            isMobileUA: isMobileUA,
            screenWidth: window.innerWidth,
            isMobileScreen: isMobileScreen,
            isTouchDevice: isTouchDevice,
            isAlreadyOnMobile: isAlreadyOnMobile,
            finalResult: (isMobileUA || (isMobileScreen && isTouchDevice)) && !isAlreadyOnMobile
        });

        // Return true if it's a mobile device and not already on mobile page
        return (isMobileUA || (isMobileScreen && isTouchDevice)) && !isAlreadyOnMobile;
    }

    // Get mobile page URL
    function getMobilePageUrl(currentPath) {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Skip if already on mobile page
        if (filename.includes('-mobile.html')) {
            return null;
        }

        // Skip admin pages
        if (path.includes('/admin/') || filename.includes('admin')) {
            return null;
        }

        // Skip if no mobile version exists
        const mobileFilename = filename.replace('.html', '-mobile.html');
        
        // Map of desktop to mobile pages
        const pageMap = {
            'layout-winter-frost.html': 'layout-winter-frost-mobile.html',
            'collections.html': 'collections-mobile.html',
            'contact.html': 'contact-mobile.html',
            'cart.html': 'cart-mobile.html',
            'checkout.html': 'checkout-mobile.html',
            'product-detail.html': 'product-detail-mobile.html',
            'auth.html': 'auth-mobile.html',
            'profile.html': 'profile-mobile.html',
            'order-confirmation.html': 'order-confirmation-mobile.html',
            'order-details.html': 'order-details-mobile.html'
        };

        return pageMap[filename] || null;
    }

    // Check if mobile page exists
    function checkMobilePageExists(mobileUrl) {
        return new Promise((resolve) => {
            if (!mobileUrl) {
                console.log('No mobile URL provided');
                resolve(false);
                return;
            }

            console.log('Checking if mobile page exists:', mobileUrl);
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', mobileUrl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    const exists = xhr.status === 200;
                    console.log('Mobile page check result:', exists, 'Status:', xhr.status);
                    resolve(exists);
                }
            };
            xhr.onerror = () => {
                console.log('Error checking mobile page');
                resolve(false);
            };
            xhr.send();
        });
    }

    // Show mobile detection notification
    function showMobileNotification() {
        const notification = document.createElement('div');
        notification.id = 'mobile-detection-notification';
        notification.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #c8e6ff, #007bff);
            color: #000000;
            padding: 12px 20px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        
        notification.innerHTML = `
            <span>📱 Mobile version detected! </span>
            <button onclick="redirectToMobile()" style="background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; padding: 4px 8px; margin-left: 8px; cursor: pointer; font-size: 12px;">Switch to Mobile</button>
            <button onclick="dismissMobileNotification()" style="background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; padding: 4px 8px; margin-left: 4px; cursor: pointer; font-size: 12px;">×</button>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);
    }

    // Redirect to mobile version
    function redirectToMobile() {
        const mobileUrl = getMobilePageUrl();
        if (mobileUrl) {
            // Store preference to stay on mobile
            localStorage.setItem('preferMobile', 'true');
            window.location.href = mobileUrl;
        }
    }

    // Dismiss mobile notification
    function dismissMobileNotification() {
        const notification = document.getElementById('mobile-detection-notification');
        if (notification) {
            notification.remove();
        }
        // Store preference to stay on desktop
        localStorage.setItem('preferMobile', 'false');
    }

    // Check user preference
    function getUserPreference() {
        return localStorage.getItem('preferMobile');
    }

    // Main mobile detection logic
    async function initMobileDetection() {
        // Check if mobile device
        if (!isMobileDevice()) {
            console.log('Not a mobile device, skipping redirect');
            return;
        }

        // Get mobile page URL
        const mobileUrl = getMobilePageUrl();
        if (!mobileUrl) {
            console.log('No mobile page URL found for current page');
            return;
        }

        console.log('Mobile device detected, redirecting to:', mobileUrl);

        // Check if mobile page exists
        const mobilePageExists = await checkMobilePageExists(mobileUrl);
        if (!mobilePageExists) {
            console.log('Mobile page does not exist:', mobileUrl);
            return;
        }

        // Auto-redirect to mobile version for mobile devices
        window.location.href = mobileUrl;
    }

    // Make functions globally available
    window.redirectToMobile = redirectToMobile;
    window.dismissMobileNotification = dismissMobileNotification;

    // Initialize mobile detection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileDetection);
    } else {
        initMobileDetection();
    }

    // Re-check on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initMobileDetection();
        }, 500);
    });

    // Add mobile detection info to console
    console.log('📱 Mobile Detection Script Loaded');
    console.log('Device Info:', {
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isMobile: isMobileDevice(),
        userPreference: getUserPreference()
    });

    // Show debug info on page for mobile devices
    function showDebugInfo() {
        const debugInfo = {
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            isMobile: isMobileDevice(),
            currentPage: window.location.pathname,
            mobileUrl: getMobilePageUrl()
        };

        const debugDiv = document.createElement('div');
        debugDiv.id = 'mobile-debug-info';
        debugDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            font-size: 12px;
            z-index: 10000;
            border-bottom: 2px solid #c8e6ff;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        debugDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>📱 Mobile Debug Info</strong>
                <button onclick="document.getElementById('mobile-debug-info').remove()" style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
            </div>
            <div style="margin-top: 8px;">
                <div><strong>Screen:</strong> ${debugInfo.screenWidth}x${debugInfo.screenHeight}</div>
                <div><strong>Touch:</strong> ${debugInfo.isTouchDevice ? 'Yes' : 'No'}</div>
                <div><strong>Mobile:</strong> ${debugInfo.isMobile ? 'Yes' : 'No'}</div>
                <div><strong>Page:</strong> ${debugInfo.currentPage}</div>
                <div><strong>Mobile URL:</strong> ${debugInfo.mobileUrl || 'None'}</div>
                <div style="margin-top: 8px;">
                    <button onclick="window.location.href='${debugInfo.mobileUrl}'" style="background: #c8e6ff; color: black; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Go to Mobile</button>
                    <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Reload</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(debugDiv);
    }

    // Show debug info after 2 seconds
    setTimeout(showDebugInfo, 2000);

})();
