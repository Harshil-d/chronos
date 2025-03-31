import { formatTimeRange } from '../utils/timeUtils.js';

export class Events {
    constructor() {
        this.currentSessionStart = null;
    }

    /**
     * Initialize the events component
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Add any event listeners here if needed
    }

    /**
     * Update events display with new data
     * @param {Array} events - Array of events
     */
    update(events) {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';

        // Sort events by timestamp in descending order
        const sortedEvents = [...events].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Group events by date
        const eventsByDate = this.groupEventsByDate(sortedEvents);

        // Create HTML for each date group
        Object.entries(eventsByDate).forEach(([date, dateEvents]) => {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'events-date-header';
            dateHeader.textContent = this.formatEventDate(date);
            eventsList.appendChild(dateHeader);

            dateEvents.forEach(event => {
                const eventElement = this.createEventElement(event);
                eventsList.appendChild(eventElement);
            });
        });
    }

    /**
     * Group events by date
     * @param {Array} events - Array of events
     * @returns {Object} Events grouped by date
     */
    groupEventsByDate(events) {
        return events.reduce((groups, event) => {
            const date = event.timestamp.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(event);
            return groups;
        }, {});
    }

    /**
     * Create event element
     * @param {Object} event - Event object
     * @returns {HTMLElement} Event element
     */
    createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        
        const eventTime = new Date(event.timestamp);
        const timeString = eventTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        let eventType = '';
        let eventIcon = '';
        let eventDescription = '';

        switch (event.type) {
            case 'startup':
                eventType = 'startup';
                eventIcon = '🚀';
                eventDescription = 'System startup';
                break;
            case 'unlock':
                eventType = 'unlock';
                eventIcon = '🔓';
                eventDescription = 'System unlocked';
                break;
            case 'lock':
                eventType = 'lock';
                eventIcon = '🔒';
                eventDescription = 'System locked';
                break;
            case 'system_shutdown':
                eventType = 'shutdown';
                eventIcon = '🔄';
                eventDescription = 'System shutdown';
                break;
            case 'logout':
                eventType = 'logout';
                eventIcon = '👋';
                eventDescription = 'User logout';
                break;
            case 'current':
                eventType = 'current';
                eventIcon = '⚡';
                eventDescription = 'Current session';
                break;
            default:
                eventType = 'unknown';
                eventIcon = '❓';
                eventDescription = 'Unknown event';
        }

        eventElement.innerHTML = `
            <div class="event-time">${timeString}</div>
            <div class="event-icon">${eventIcon}</div>
            <div class="event-details">
                <div class="event-type ${eventType}">${eventDescription}</div>
                ${this.getEventDuration(event)}
            </div>
        `;

        return eventElement;
    }

    /**
     * Get event duration HTML
     * @param {Object} event - Event object
     * @returns {string} Duration HTML
     */
    getEventDuration(event) {
        if (event.type === 'current' && this.currentSessionStart) {
            const now = new Date();
            const duration = now - this.currentSessionStart;
            return `<div class="event-duration">${formatTimeRange(this.currentSessionStart, now)}</div>`;
        }

        const nextEvent = this.findNextEvent(event);
        if (nextEvent) {
            return `<div class="event-duration">${formatTimeRange(event.timestamp, nextEvent.timestamp)}</div>`;
        }

        return '';
    }

    /**
     * Find next event
     * @param {Object} currentEvent - Current event
     * @returns {Object|null} Next event or null
     */
    findNextEvent(currentEvent) {
        // This would need to be implemented based on your event data structure
        // For now, returning null
        return null;
    }

    /**
     * Format event date
     * @param {string} date - Date string
     * @returns {string} Formatted date string
     */
    formatEventDate(date) {
        const eventDate = new Date(date);
        return eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Set current session start time
     * @param {Date} startTime - Start time of current session
     */
    setCurrentSession(startTime) {
        this.currentSessionStart = startTime;
    }

    /**
     * Clear current session
     */
    clearCurrentSession() {
        this.currentSessionStart = null;
    }
} 