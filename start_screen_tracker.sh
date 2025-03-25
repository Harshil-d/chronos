#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Check if required packages are installed
if ! python3 -c "import psutil" 2>/dev/null; then
    echo "Required packages not found. Please run setup.sh first."
    exit 1
fi

# Start the tracker
python3 screen_time_tracker.py 