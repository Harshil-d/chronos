/**
 * Load data for a specific date
 * @param {string} date - Date to load data for
 * @returns {Promise<Object>} Data for the date
 */
export async function loadDataForDate(date) {
    try {
        const response = await fetch(`/data/screen_time_data/screen_time_${date}.json`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            return { date, events: [] };
        }
        
        const data = await response.json();
        return { date, ...data };
    } catch (error) {
        console.error(`Error loading data for ${date}:`, error);
        return { date, events: [] };
    }
}

/**
 * Load data for multiple dates
 * @param {string} startDate - Start date
 * @param {number} days - Number of days to load
 * @returns {Promise<Object>} Combined data for all dates
 */
export async function loadDataForDateRange(startDate, days) {
    try {
        // Get the dates array
        const dates = [];
        const selectedDate = new Date(startDate);
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        // Load data for all dates
        const allData = await Promise.all(
            dates.map(date => loadDataForDate(date))
        );

        // Combine all events
        return {
            events: allData.flatMap(data => data.events),
            dates: dates
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return { events: [], dates: [] };
    }
}

/**
 * Find current session from events
 * @param {Array} events - Array of events
 * @returns {Object|null} Current session object or null
 */
export function findCurrentSession(events) {
    const sortedEvents = [...events].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    for (const event of sortedEvents) {
        if (event.type === 'lock' || event.type === 'system_shutdown' || event.type === 'logout') {
            break;
        }
        if (event.type === 'startup' || event.type === 'unlock') {
            return {
                start_time: event.timestamp,
                is_active: true
            };
        }
    }
    
    return null;
}

/**
 * Register service worker
 */
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
} 