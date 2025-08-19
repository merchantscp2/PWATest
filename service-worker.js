// service-worker.js - Upload this file to your GitHub Pages root directory

console.log('Service Worker: Script loaded');

// Install event - when service worker is first installed
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    
    // Skip waiting to become the active service worker
    self.skipWaiting();
});

// Activate event - when service worker becomes active
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activated');
    
    // Claim all clients immediately
    event.waitUntil(self.clients.claim());
});

// Push event - when a push notification is received
self.addEventListener('push', function(event) {
    console.log('Service Worker: Push received', event);
    
    let notificationData = {
        title: 'PWA Push Demo',
        body: 'Default notification body',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk5IiBoZWlnaHQ9IjE5OSIgdmlld0JveD0iMCAwIDE5OSAxOTkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJ3dGYtMTQ2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSI1JSIgc3RvcC1jb2xvcj0iI2ZmNjYzNyIvPjxzdG9wIG9mZnNldD0iMjAlIiBzdG9wLWNvbG9yPSIjMzAzMzAyZSIvPjxzdG9wIG9mZnNldD0iODAlIiBzdG9wLWNvbG9yPSIjMzkzOTM5ZiIvPjwvbGluZWFyR3JhZGllbnQ+PHRleHQgeD0iMTAwIiB5PSI2MCI+PC90ZXh0Pjx0ZXh0UGF0aCBpZD0iNTIyIiB0ZXh0PSJURVhUQSI+',
        badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk5IiBoZWlnaHQ9IjE5OSIgdmlld0JveD0iMCAwIDE5OSAxOTkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE5OSIgaGVpZ2h0PSIxOTkiIGZpbGw9IiMwMDdhZmYiLz48L3N2Zz4=',
        vibrate: [200, 100, 200],
        tag: 'pwa-demo',
        requireInteraction: true
    };
    
    // Try to parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (e) {
            // If JSON parsing fails, use text
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click event - when user clicks on notification
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification clicked', event);
    
    // Handle action clicks
    if (event.action) {
        console.log('Service Worker: Action clicked:', event.action);
        
        switch (event.action) {
            case 'like':
                console.log('User liked the notification');
                // In a real app, you'd send this to your server
                // fetch('/api/like', { method: 'POST', body: JSON.stringify({id: event.notification.data.id}) });
                break;
                
            case 'reply':
                console.log('User wants to reply');
                // Open reply interface
                event.waitUntil(
                    clients.openWindow('/?action=reply&id=' + (event.notification.data?.id || 'default'))
                );
                break;
                
            case 'dismiss':
                console.log('User dismissed notification');
                // Just close, no action needed
                break;
                
            case 'view':
                console.log('User wants to view details');
                // Open specific page
                event.waitUntil(
                    clients.openWindow('/?action=view&id=' + (event.notification.data?.id || 'default'))
                );
                break;
                
            default:
                console.log('Unknown action:', event.action);
                // Default behavior - open the app
                event.waitUntil(
                    clients.openWindow('/')
                );
        }
    } else {
        // Default click (on notification body) - open the app
        console.log('Notification body clicked - opening app');
        event.waitUntil(
            clients.openWindow('/')
        );
    }
    
    // Close the notification
    event.notification.close();
});

// Notification close event - when notification is dismissed
self.addEventListener('notificationclose', function(event) {
    console.log('Service Worker: Notification was closed/dismissed', event);
    
    // Track notification dismissal analytics
    // In a real app: fetch('/api/analytics/notification-dismissed', { method: 'POST' });
});

// Message event - for communication with the main thread
self.addEventListener('message', function(event) {
    console.log('Service Worker: Message received', event.data);
    
    // Handle different message types
    switch (event.data.type) {
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: '1.0.0' });
            break;
            
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'SEND_TEST_NOTIFICATION':
            // Send a test notification from service worker
            self.registration.showNotification('Test from Service Worker', {
                body: 'This notification was triggered by a message from the main thread!',
                icon: event.data.icon || '/icon-192.png',
                tag: 'sw-test',
                actions: [
                    { action: 'ok', title: '👍 OK' },
                    { action: 'dismiss', title: '❌ Dismiss' }
                ]
            });
            break;
            
        default:
            console.log('Unknown message type:', event.data.type);
    }
});

// Fetch event - for caching and offline functionality (optional)
self.addEventListener('fetch', function(event) {
    // For now, just let all requests go through normally
    // In a full PWA, you'd implement caching strategies here
    
    // Example of basic caching (commented out to keep it simple):
    /*
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
    */
});

console.log('Service Worker: Script fully loaded and event listeners registered');
