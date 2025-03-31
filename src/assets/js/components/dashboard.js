import { formatTime } from '../utils/timeUtils.js';
import { calculateStats } from '../utils/dataUtils.js';
import { initializeChart, updateChartData, formatChartData } from '../utils/chartUtils.js';

export class Dashboard {
    constructor() {
        this.chart = null;
    }

    /**
     * Initialize the dashboard
     */
    init() {
        this.initializeChart();
        this.setupEventListeners();
    }

    /**
     * Initialize the chart
     */
    initializeChart() {
        this.chart = initializeChart();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const daysInput = document.getElementById('daysInput');
        daysInput.addEventListener('change', () => {
            const event = new CustomEvent('daysChange', { 
                detail: { days: parseInt(daysInput.value) || 7 } 
            });
            document.dispatchEvent(event);
        });
    }

    /**
     * Update dashboard with new data
     * @param {Object} data - Data object containing events and dates
     */
    update(data) {
        // Calculate stats for the most recent day
        const lastDate = data.dates[data.dates.length - 1];
        const lastDayEvents = data.events.filter(event => 
            event.timestamp.startsWith(lastDate)
        );

        // Calculate stats
        const stats = calculateStats(lastDayEvents, true);
        this.updateStatsDisplay(stats);

        // Update chart
        const chartData = formatChartData(data.events, data.dates);
        updateChartData(
            this.chart,
            chartData.dates,
            chartData.workDurations,
            chartData.sleepDurations
        );
    }

    /**
     * Update stats display
     * @param {Object} stats - Statistics object
     */
    updateStatsDisplay(stats) {
        document.getElementById('totalDuration').textContent = formatTime(stats.totalDuration);
        document.getElementById('workDuration').textContent = formatTime(stats.workDuration);
        document.getElementById('offTimeDuration').textContent = formatTime(stats.sleepDuration);
        document.getElementById('startupCount').textContent = stats.startupCount;
        document.getElementById('sessionCount').textContent = stats.sessionCount;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
} 