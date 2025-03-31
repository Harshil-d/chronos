/**
 * Format seconds into HH:MM:SS format
 * @param {number} seconds - Number of seconds to format
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a date string into a localized date string
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted date string
 */
export function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
}

/**
 * Format a date string into a localized time string
 * @param {string} timestamp - Timestamp to format
 * @returns {string} Formatted time string
 */
export function formatEventTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Format a date string into a localized date string for events
 * @param {string} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export function formatEventDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Calculate duration between two timestamps in seconds
 * @param {string} startTime - Start timestamp
 * @param {string} endTime - End timestamp
 * @returns {number} Duration in seconds
 */
export function calculateTimeSlotDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end - start) / 1000; // Convert to seconds
}

/**
 * Calculate working hours for the current day
 * @returns {number} Working hours in seconds
 */
export function calculateWorkingHours() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Set working hours (9 AM to 6 PM)
    const workStart = new Date(startOfDay);
    workStart.setHours(9, 0, 0, 0);
    
    const workEnd = new Date(startOfDay);
    workEnd.setHours(18, 0, 0, 0);
    
    // If current time is before work start, show 0
    if (now < workStart) {
        return 0;
    }
    
    // If current time is after work end, show full working hours (9 hours)
    if (now > workEnd) {
        return 9 * 3600; // 9 hours in seconds
    }
    
    // Calculate duration from work start to current time
    const duration = (now - workStart) / 1000; // Convert to seconds
    return duration;
}

/**
 * Format time range for display
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {string} Formatted time range
 */
export function formatTimeRange(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
} 