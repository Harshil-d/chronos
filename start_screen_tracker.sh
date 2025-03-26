#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Activate virtual environment
source "$DIR/venv/bin/activate"

# Check if required packages are installed
if ! python3 -c "import psutil" 2>/dev/null; then
    echo "Required packages not found. Please run setup.sh first."
    exit 1
fi

# Start the screen time tracker
python3 "$DIR/src/tracker/screen_time_tracker.py"

echo "Chronos screen time tracker started successfully!" 