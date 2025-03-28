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
    echo "Starting tracker..."
    nohup python3 "$DIR/src/tracker/screen_time_tracker.py" > "$DIR/logs/tracker.log" 2>&1 &
    TRACKER_PID=$!
    
    # Wait a bit to see if the process is still running
    sleep 5
    if ! kill -0 $TRACKER_PID 2>/dev/null; then
        echo "Tracker failed to start properly"
        cat "$DIR/logs/tracker.log"
        return 1
    fi
    
    echo $TRACKER_PID
    return 0
}

# Function to start server
start_server() {
    echo "Starting server..."
    nohup python3 "$DIR/src/server/serve_viewer.py" > "$DIR/logs/server.log" 2>&1 &
    SERVER_PID=$!
    
    # Wait a bit to see if the process is still running
    sleep 5
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "Server failed to start properly"
        cat "$DIR/logs/server.log"
        return 1
    fi
    
    echo $SERVER_PID
    return 0
}

# Activate virtual environment
if [ ! -f "$DIR/venv/bin/activate" ]; then
    echo "Virtual environment not found at $DIR/venv"
    exit 1
fi

echo "Activating virtual environment..."
source "$DIR/venv/bin/activate"

# Kill any existing instances
echo "Cleaning up existing processes..."
pkill -f "python3.*screen_time_tracker.py" || true
pkill -f "python3.*serve_viewer.py" || true
sleep 2

# Start initial processes
echo "Starting processes..."
TRACKER_PID=$(start_tracker)
if [ $? -ne 0 ]; then
    echo "Failed to start tracker"
    exit 1
fi

SERVER_PID=$(start_server)
if [ $? -ne 0 ]; then
    echo "Failed to start server"
    kill $TRACKER_PID
    exit 1
fi

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
        if [ $? -eq 0 ]; then
            echo "$TRACKER_PID" > "$DIR/logs/tracker.pid"
            echo "[$(date)] Tracker restarted with PID: $TRACKER_PID" >> "$DIR/logs/startup.log"
        else
            echo "[$(date)] Failed to restart tracker" >> "$DIR/logs/startup.log"
        fi
    fi

    # Check server
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "[$(date)] Server process died (PID: $SERVER_PID), restarting..." >> "$DIR/logs/startup.log"
        SERVER_PID=$(start_server)
        if [ $? -eq 0 ]; then
            echo "$SERVER_PID" > "$DIR/logs/server.pid"
            echo "[$(date)] Server restarted with PID: $SERVER_PID" >> "$DIR/logs/startup.log"
        else
            echo "[$(date)] Failed to restart server" >> "$DIR/logs/startup.log"
        fi
    fi

    sleep 10
done 