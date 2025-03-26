#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create logs directory if it doesn't exist
mkdir -p "$DIR/logs"

# Export display for GUI applications
export DISPLAY=:0
export XAUTHORITY="${HOME}/.Xauthority"

# Function to start tracker
start_tracker() {
    nohup python3 "$DIR/src/tracker/screen_time_tracker.py" > "$DIR/logs/tracker.log" 2>&1 &
    echo $!
}

# Function to start server
start_server() {
    nohup python3 "$DIR/src/server/serve_viewer.py" > "$DIR/logs/server.log" 2>&1 &
    echo $!
}

# Wait for X server to be ready
for i in {1..30}; do
    if xset q &>/dev/null; then
        break
    fi
    sleep 1
done

# Activate virtual environment
source "$DIR/venv/bin/activate"

# Kill any existing instances
pkill -f "python3.*screen_time_tracker.py" || true
pkill -f "python3.*serve_viewer.py" || true

# Start initial processes
TRACKER_PID=$(start_tracker)
SERVER_PID=$(start_server)

# Write initial PIDs to file
echo "$TRACKER_PID" > "$DIR/logs/tracker.pid"
echo "$SERVER_PID" > "$DIR/logs/server.pid"

# Log startup
echo "[$(date)] Chronos started successfully! Tracker PID: $TRACKER_PID, Server PID: $SERVER_PID" >> "$DIR/logs/startup.log"
echo "Chronos started successfully!"
echo "View the screen time tracker at http://localhost:4567/"

# Keep the script running and monitor processes
while true; do
    # Check tracker
    if ! kill -0 $TRACKER_PID 2>/dev/null; then
        echo "[$(date)] Tracker process died (PID: $TRACKER_PID), restarting..." >> "$DIR/logs/startup.log"
        TRACKER_PID=$(start_tracker)
        echo "$TRACKER_PID" > "$DIR/logs/tracker.pid"
        echo "[$(date)] Tracker restarted with PID: $TRACKER_PID" >> "$DIR/logs/startup.log"
    fi

    # Check server
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "[$(date)] Server process died (PID: $SERVER_PID), restarting..." >> "$DIR/logs/startup.log"
        SERVER_PID=$(start_server)
        echo "$SERVER_PID" > "$DIR/logs/server.pid"
        echo "[$(date)] Server restarted with PID: $SERVER_PID" >> "$DIR/logs/startup.log"
    fi

    sleep 10
done 