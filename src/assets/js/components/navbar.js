import { formatTime } from '../utils/timeUtils.js';

export class Navbar {
    constructor() {
        this.currentSessionStart = null;
        this.updateInterval = null;
    }

    /**
     * Initialize the navbar
     */
    init() {
        this.setupDatePicker();
        this.setupEventListeners();
    }

    /**
     * Set up the date picker
     */
    setupDatePicker() {
        const datePicker = document.getElementById('datePicker');
        datePicker.valueAsDate = new Date();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const datePicker = document.getElementById('datePicker');
        datePicker.addEventListener('change', (e) => {
            this.onDateChange(e.target.value);
        });
    }

    /**
     * Handle date change
     * @param {string} date - Selected date
     */
    onDateChange(date) {
        // Dispatch custom event for date change
        const event = new CustomEvent('dateChange', { detail: { date } });
        document.dispatchEvent(event);
    }

    /**
     * Update current session display
     */
    updateCurrentSessionDisplay() {
        if (this.currentSessionStart) {
            const now = new Date();
            const duration = (now - this.currentSessionStart) / 1000;
            document.getElementById('headerCurrentSession').textContent = formatTime(duration);
        } else {
            document.getElementById('headerCurrentSession').textContent = '00:00:00';
        }
    }

    /**
     * Update current session
     * @param {Object} data - Session data
     */
    updateCurrentSession(data) {
        if (data.current_session && data.current_session.start_time) {
            const now = new Date();
            const startTime = new Date(data.current_session.start_time);
            
            // Only update if the session started today
            if (startTime.toDateString() === now.toDateString()) {
                this.currentSessionStart = startTime;
                this.updateCurrentSessionDisplay();
                
                if (!this.updateInterval) {
                    this.updateInterval = setInterval(() => this.updateCurrentSessionDisplay(), 1000);
                }
            } else {
                this.clearCurrentSession();
            }
        } else {
            this.clearCurrentSession();
        }
    }

    /**
     * Clear current session
     */
    clearCurrentSession() {
        this.currentSessionStart = null;
        document.getElementById('headerCurrentSession').textContent = '00:00:00';
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Update header stats
     * @param {Object} stats - Statistics object
     */
    updateHeaderStats(stats) {
        document.getElementById('headerTotalDuration').textContent = formatTime(stats.totalDuration);
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
} 