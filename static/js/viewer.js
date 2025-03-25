let currentSessionStart = null;
let updateInterval = null;

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
}

function calculateTimeSlotDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end - start) / 1000; // Convert to seconds
}

function updateCurrentSessionDisplay() {
    if (currentSessionStart) {
        const now = new Date();
        const duration = (now - currentSessionStart) / 1000;
        document.getElementById('currentSessionTime').textContent = formatTime(duration);
    }
}

function updateCurrentSession(data) {
    const currentSession = data.current_session;
    const sessionStatus = document.getElementById('sessionStatus');
    const currentSessionTime = document.getElementById('currentSessionTime');
    const currentSessionDiv = document.getElementById('currentSession');

    if (currentSession.is_active && currentSession.start_time) {
        sessionStatus.textContent = 'Active';
        currentSessionDiv.classList.add('active');
        currentSessionDiv.classList.remove('inactive');
        currentSessionDiv.classList.add('active-session');

        // Set the start time for the current session
        currentSessionStart = new Date(currentSession.start_time);
        
        // Update the display immediately
        updateCurrentSessionDisplay();
        
        // Start the update interval if not already running
        if (!updateInterval) {
            updateInterval = setInterval(updateCurrentSessionDisplay, 1000);
        }
    } else {
        sessionStatus.textContent = 'Inactive';
        currentSessionDiv.classList.remove('active', 'active-session');
        currentSessionDiv.classList.add('inactive');
        currentSessionTime.textContent = '00:00:00';
        currentSessionStart = null;
        
        // Clear the update interval
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }
}

function displayData(data) {
    const timeSlotsDiv = document.getElementById('timeSlots');
    timeSlotsDiv.innerHTML = '';
    
    // Display total time
    document.getElementById('totalTime').textContent = formatTime(data.total_time);

    // Update current session
    updateCurrentSession(data);

    // Display individual time slots
    const events = data.events;
    for (let i = 1; i < events.length; i++) {
        if (events[i-1].type === 'unlock' && events[i].type === 'lock') {
            const duration = calculateTimeSlotDuration(events[i-1].timestamp, events[i].timestamp);
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.innerHTML = `
                <strong>Session ${i}:</strong><br>
                Start: ${formatDateTime(events[i-1].timestamp)}<br>
                End: ${formatDateTime(events[i].timestamp)}<br>
                Duration: ${formatTime(duration)}
            `;
            timeSlotsDiv.appendChild(timeSlot);
        }
    }

    // Display all events in chronological order
    const eventsList = document.createElement('div');
    eventsList.className = 'mt-4';
    eventsList.innerHTML = '<h6>All Events</h6>';
    
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'mb-2';
        eventDiv.innerHTML = `
            <span class="badge event-badge ${event.type}">${event.type}</span>
            ${formatDateTime(event.timestamp)}
        `;
        eventsList.appendChild(eventDiv);
    });
    
    timeSlotsDiv.appendChild(eventsList);
}

async function loadData(date) {
    try {
        const response = await fetch(`/data/screen_time_data/screen_time_${date}.json`);
        if (!response.ok) {
            throw new Error('No data available for this date');
        }
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('timeSlots').innerHTML = '<p class="text-danger">No data available for this date</p>';
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up date picker
    const datePicker = document.getElementById('datePicker');
    datePicker.valueAsDate = new Date();
    
    // Load today's data by default
    loadData(new Date().toISOString().split('T')[0]);

    // Load data when date is changed
    datePicker.addEventListener('change', (e) => {
        loadData(e.target.value);
    });

    // Update data every second
    setInterval(() => {
        const currentDate = datePicker.value;
        loadData(currentDate);
    }, 1000);

    // Clean up interval when page is closed
    window.addEventListener('beforeunload', () => {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    });
}); 