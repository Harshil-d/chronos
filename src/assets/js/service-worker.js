const CACHE_NAME = 'screen-time-viewer-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/components/navbar.css',
    '/assets/css/components/dashboard.css',
    '/assets/css/components/timeline.css',
    '/assets/css/components/events.css',
    '/assets/js/app.js',
    '/assets/js/components/navbar.js',
    '/assets/js/components/dashboard.js',
    '/assets/js/components/timeline.js',
    '/assets/js/components/events.js',
    '/assets/js/services/dataService.js',
    '/assets/js/utils/timeUtils.js',
    '/assets/js/utils/dataUtils.js',
    '/assets/js/utils/chartUtils.js',
    '/assets/images/logo.png',
    '/assets/images/favicon.png'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Clone the request because it can only be used once
                const fetchRequest = event.request.clone();

                // Make network request and cache the response
                return fetch(fetchRequest).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response because it can only be used once
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
}); 