/**
 * Initialize the duration chart
 * @param {string} canvasId - ID of the canvas element
 * @returns {Chart} Chart instance
 */
export function initializeChart(canvasId = 'durationChart') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Work Time',
                    data: [],
                    backgroundColor: 'rgba(138, 111, 247, 0.8)',
                    borderColor: 'rgb(138, 111, 247)',
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: 'Sleep Time',
                    data: [],
                    backgroundColor: 'rgba(165, 148, 249, 0.8)',
                    borderColor: 'rgb(165, 148, 249)',
                    borderWidth: 1,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Duration (hours)',
                        color: '#4A3B8C',
                        font: {
                            weight: 'bold'
                        }
                    },
                    max: 24,
                    grid: {
                        color: 'rgba(138, 111, 247, 0.1)'
                    },
                    ticks: {
                        color: '#4A3B8C'
                    }
                },
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#4A3B8C',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(138, 111, 247, 0.1)'
                    },
                    ticks: {
                        color: '#4A3B8C'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#4A3B8C',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Daily Time Distribution',
                    color: '#4A3B8C',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(138, 111, 247, 0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toFixed(1)} hours`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update chart data with new values
 * @param {Chart} chart - Chart instance
 * @param {Array} dates - Array of dates
 * @param {Array} workDurations - Array of work durations in hours
 * @param {Array} sleepDurations - Array of sleep durations in hours
 */
export function updateChartData(chart, dates, workDurations, sleepDurations) {
    chart.data.labels = dates;
    chart.data.datasets[0].data = workDurations;
    chart.data.datasets[1].data = sleepDurations;
    chart.update();
}

/**
 * Format chart data from events
 * @param {Array} events - Array of events
 * @param {Array} dates - Array of dates
 * @returns {Object} Formatted chart data
 */
export function formatChartData(events, dates) {
    const workDurations = [];
    const sleepDurations = [];
    const formattedDates = [];

    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
        const date = event.timestamp.split('T')[0];
        if (!eventsByDate[date]) {
            eventsByDate[date] = [];
        }
        eventsByDate[date].push(event);
    });

    // Process each date
    dates.forEach(date => {
        const dateEvents = eventsByDate[date] || [];
        const stats = calculateStats(dateEvents, date === new Date().toISOString().split('T')[0]);
        
        // Format date for display
        const displayDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        formattedDates.push(displayDate);
        
        // Convert to hours
        workDurations.push(stats.workDuration / 3600);
        sleepDurations.push(stats.sleepDuration / 3600);
    });

    return {
        dates: formattedDates,
        workDurations,
        sleepDurations
    };
} 