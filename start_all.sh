#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start the screen time tracker in the background
cd "$DIR"
python3 src/tracker/screen_time_tracker.py &

# Start the viewer server
python3 src/server/serve_viewer.py 