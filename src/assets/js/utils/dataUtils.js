/**
 * Calculate statistics from events
 * @param {Array} events - Array of events
 * @param {boolean} includeCurrentSession - Whether to include current session
 * @param {Date} currentSessionStart - Start time of current session
 * @returns {Object} Statistics object
 */
export function calculateStats(events, includeCurrentSession = false, currentSessionStart = null) {
    const stats = {
        totalDuration: 0,
        workDuration: 0,
        sleepDuration: 0,
        otherOffTimeDuration: 0,
        startupCount: 0,
        sessionCount: 0
    };

    let currentSession = null;
    const sortedEvents = [...events].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (let i = 0; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];
        
        if (event.type === 'startup') {
            stats.startupCount++;
        }
        
        if (event.type === 'startup' || event.type === 'unlock') {
            currentSession = {
                start: new Date(event.timestamp)
            };
        } else if ((event.type === 'lock' || event.type === 'system_shutdown' || event.type === 'logout') && currentSession) {
            const duration = (new Date(event.timestamp) - currentSession.start) / 1000;
            stats.workDuration += duration;
            stats.sessionCount++;
            currentSession = null;
        }
    }

    // Calculate total duration between first and last event
    if (sortedEvents.length >= 2) {
        const firstEvent = new Date(sortedEvents[0].timestamp);
        const lastEvent = new Date(sortedEvents[sortedEvents.length - 1].timestamp);
        stats.totalDuration = (lastEvent - firstEvent) / 1000;
    }

    // Add current session duration if requested and exists
    if (includeCurrentSession && currentSessionStart) {
        const now = new Date();
        const sessionStartDate = new Date(currentSessionStart);
        
        // Only include if the session started today
        if (sessionStartDate.toDateString() === now.toDateString()) {
            const currentSessionDuration = (now - sessionStartDate) / 1000;
            stats.workDuration += currentSessionDuration;
            stats.totalDuration += currentSessionDuration;
            stats.sessionCount++; // Count current session
        }
    }

    // Calculate sleep time (time between first and last event, excluding work time)
    stats.sleepDuration = Math.max(0, stats.totalDuration - stats.workDuration);

    return stats;
}

/**
 * Process timeline data from events
 * @param {Array} events - Array of events
 * @returns {Object} Events grouped by date
 */
export function processTimelineData(events) {
    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Group events by date
    const eventsByDate = {};
    sortedEvents.forEach(event => {
        const date = event.timestamp.split('T')[0];
        if (!eventsByDate[date]) {
            eventsByDate[date] = [];
        }
        eventsByDate[date].push(event);
    });

    return eventsByDate;
}

/**
 * Get event icon class based on event type
 * @param {string} type - Event type
 * @returns {string} Icon class name
 */
export function getEventIcon(type) {
    switch(type) {
        case 'startup': return 'bi-power';
        case 'shutdown': return 'bi-power-off';
        case 'lock': return 'bi-lock';
        case 'unlock': return 'bi-unlock';
        case 'logout': return 'bi-box-arrow-right';
        case 'system_shutdown': return 'bi-power-off';
        default: return 'bi-circle';
    }
}

/**
 * Group events by date
 * @param {Array} events - Array of events
 * @returns {Object} Events grouped by date
 */
export function groupEventsByDate(events) {
    const eventsByDate = {};
    events.forEach(event => {
        const date = event.timestamp.split('T')[0];
        if (!eventsByDate[date]) {
            eventsByDate[date] = [];
        }
        eventsByDate[date].push(event);
    });
    return eventsByDate;
}

/**
 * Sort events by timestamp
 * @param {Array} events - Array of events
 * @param {boolean} ascending - Whether to sort in ascending order
 * @returns {Array} Sorted events
 */
export function sortEventsByTimestamp(events, ascending = true) {
    return [...events].sort((a, b) => {
        const comparison = new Date(a.timestamp) - new Date(b.timestamp);
        return ascending ? comparison : -comparison;
    });
} 