import { Navbar } from './components/navbar.js';
import { Dashboard } from './components/dashboard.js';
import { Timeline } from './components/timeline.js';
import { Events } from './components/events.js';
import { loadDataForDate, loadDataForDateRange, findCurrentSession, registerServiceWorker } from './services/dataService.js';

class App {
    constructor() {
        this.navbar = new Navbar();
        this.dashboard = new Dashboard();
        this.timeline = new Timeline();
        this.events = new Events();
        this.currentDate = new Date();
        this.daysToShow = 7;
    }

    /**
     * Initialize the application
     */
    async init() {
        // Register service worker for offline support
        registerServiceWorker();

        // Initialize components
        this.navbar.init();
        this.dashboard.init();
        this.timeline.init();
        this.events.init();

        // Set up event listeners
        this.setupEventListeners();

        // Load initial data
        await this.loadData();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Date change event
        document.addEventListener('dateChange', async (e) => {
            this.currentDate = e.detail.date;
            await this.loadData();
        });

        // Days change event
        document.addEventListener('daysChange', async (e) => {
            this.daysToShow = e.detail.days;
            await this.loadData();
        });
    }

    /**
     * Load data for current date range
     */
    async loadData() {
        try {
            // Load data for the date range
            const data = await loadDataForDateRange(
                this.currentDate,
                this.daysToShow
            );

            // Find current session
            const currentSession = findCurrentSession(data.events);
            if (currentSession) {
                this.navbar.updateCurrentSession(currentSession);
                this.timeline.setCurrentSession(currentSession.start);
                this.events.setCurrentSession(currentSession.start);
            } else {
                this.navbar.clearCurrentSession();
                this.timeline.clearCurrentSession();
                this.events.clearCurrentSession();
            }

            // Update components with new data
            this.dashboard.update(data);
            this.timeline.update(data.events);
            this.events.update(data.events);

            // Update header stats
            const stats = this.calculateHeaderStats(data.events);
            this.navbar.updateHeaderStats(stats);
        } catch (error) {
            console.error('Error loading data:', error);
            // Handle error appropriately
        }
    }

    /**
     * Calculate header statistics
     * @param {Array} events - Array of events
     * @returns {Object} Statistics object
     */
    calculateHeaderStats(events) {
        const stats = {
            totalDuration: 0,
            workDuration: 0,
            offTimeDuration: 0,
            startupCount: 0,
            sessionCount: 0
        };

        let currentSession = null;

        events.forEach(event => {
            if (event.type === 'startup' || event.type === 'unlock') {
                if (!currentSession) {
                    currentSession = {
                        start: new Date(event.timestamp),
                        type: 'work'
                    };
                    stats.startupCount++;
                    stats.sessionCount++;
                }
            } else if ((event.type === 'lock' || event.type === 'system_shutdown' || event.type === 'logout') && currentSession) {
                const end = new Date(event.timestamp);
                const duration = end - currentSession.start;
                stats.totalDuration += duration;
                stats.workDuration += duration;
                currentSession = null;
            }
        });

        // Handle current session if exists
        if (currentSession) {
            const now = new Date();
            const duration = now - currentSession.start;
            stats.totalDuration += duration;
            stats.workDuration += duration;
        }

        // Calculate off time duration
        stats.offTimeDuration = stats.totalDuration - stats.workDuration;

        return stats;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 