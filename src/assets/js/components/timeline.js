import { formatTimeRange } from '../utils/timeUtils.js';
import { processTimelineData } from '../utils/dataUtils.js';

export class Timeline {
    constructor() {
        this.currentSessionStart = null;
    }

    /**
     * Initialize the timeline
     */
    init() {
        this.setupTooltips();
    }

    /**
     * Set up tooltips for timeline segments
     */
    setupTooltips() {
        document.addEventListener('mouseover', (e) => {
            const segment = e.target.closest('.timeline-segment');
            if (segment) {
                const tooltip = document.createElement('div');
                tooltip.className = 'timeline-tooltip';
                tooltip.textContent = segment.dataset.tooltip;
                segment.appendChild(tooltip);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const segment = e.target.closest('.timeline-segment');
            if (segment) {
                const tooltip = segment.querySelector('.timeline-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            }
        });
    }

    /**
     * Create timeline segment
     * @param {string} startTime - Start time
     * @param {string} endTime - End time
     * @param {string} type - Segment type
     * @param {string} date - Date
     * @returns {string} HTML for timeline segment
     */
    createTimelineSegment(startTime, endTime, type, date) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const dayStart = new Date(date);
        dayStart.setHours(7, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 0, 0, 0);
        
        // Ensure times are within the visible range
        const visibleStart = new Date(Math.max(start, dayStart));
        const visibleEnd = new Date(Math.min(end, dayEnd));
        
        // Calculate position and width
        const totalMinutes = 16 * 60; // 16 hours in minutes
        const startMinutes = (visibleStart.getHours() - 7) * 60 + visibleStart.getMinutes();
        const endMinutes = (visibleEnd.getHours() - 7) * 60 + visibleEnd.getMinutes();
        
        const startPercent = (startMinutes / totalMinutes) * 100;
        const widthPercent = ((endMinutes - startMinutes) / totalMinutes) * 100;
        
        // Format duration for tooltip
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeRange = formatTimeRange(startTime, endTime);
        
        if (widthPercent > 0) {
            return `
                <div class="timeline-segment ${type}" 
                     style="left: ${startPercent}%; width: ${widthPercent}%;"
                     data-tooltip="${timeRange} (${hours}h ${minutes}m)">
                </div>
            `;
        }
        return '';
    }

    /**
     * Update timeline with new data
     * @param {Array} events - Array of events
     */
    update(events) {
        const timelineContent = document.getElementById('timelineContent');
        timelineContent.innerHTML = '';

        const eventsByDate = processTimelineData(events);
        const dates = Object.keys(eventsByDate).sort((a, b) => b.localeCompare(a));

        // Add current session to today's events if active
        const today = new Date().toISOString().split('T')[0];
        if (this.currentSessionStart && dates.includes(today)) {
            const now = new Date();
            eventsByDate[today].push({
                timestamp: now.toISOString(),
                type: 'current'
            });
        }

        // Create timeline structure
        let timelineHTML = `
            <div class="timeline-grid">
                <div class="timeline-dates">
                    <div class="timeline-date">Date</div>
                    ${dates.map(date => `
                        <div class="timeline-date">${this.formatEventDate(date)}</div>
                    `).join('')}
                </div>
                <div class="timeline-content">
                    <div class="timeline-hours">
                        ${Array.from({length: 17}, (_, i) => `
                            <div class="timeline-hour">${String(i + 7).padStart(2, '0')}:00</div>
                        `).join('')}
                    </div>
                    <div class="timeline-lines">
        `;

        // Process each date
        dates.forEach(date => {
            const dateEvents = eventsByDate[date];
            let currentSession = null;

            timelineHTML += `
                <div class="timeline-date-group">
                    <div class="timeline-line">
                        <div class="timeline-line-label">Work</div>
            `;

            // Add work segments
            for (let i = 0; i < dateEvents.length; i++) {
                const event = dateEvents[i];
                const eventTime = new Date(event.timestamp);
            
                if (event.type === 'startup' || event.type === 'unlock') {
                    if (!currentSession) {
                        currentSession = {
                            start: eventTime,
                            type: 'work'
                        };
                    }
                } else if (event.type === 'current' && currentSession) {
                    // Add current session segment with different style
                    timelineHTML += this.createTimelineSegment(
                        currentSession.start,
                        eventTime,
                        'work current',
                        date
                    );
                    currentSession = null;
                } else if ((event.type === 'lock' || event.type === 'system_shutdown' || event.type === 'logout') && currentSession) {
                    timelineHTML += this.createTimelineSegment(
                        currentSession.start,
                        eventTime,
                        'work',
                        date
                    );
                    currentSession = null;
                }
            }

            timelineHTML += `
                    </div>
                    <div class="timeline-line">
                        <div class="timeline-line-label">Break</div>
            `;

            // Add break segments
            currentSession = null;
            for (let i = 0; i < dateEvents.length; i++) {
                const event = dateEvents[i];
                const nextEvent = dateEvents[i + 1];
                
                if ((event.type === 'lock' || event.type === 'system_shutdown' || event.type === 'logout') && nextEvent) {
                    timelineHTML += this.createTimelineSegment(
                        event.timestamp,
                        nextEvent.timestamp,
                        'off',
                        date
                    );
                }
            }

            timelineHTML += `
                    </div>
                </div>
            `;
        });

        timelineHTML += `
                    </div>
                </div>
            </div>
        `;

        timelineContent.innerHTML = timelineHTML;
    }

    /**
     * Format event date
     * @param {string} timestamp - Timestamp to format
     * @returns {string} Formatted date string
     */
    formatEventDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
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