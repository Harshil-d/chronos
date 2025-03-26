#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create necessary directories
mkdir -p "$DIR/data/screen_time_data"
mkdir -p "$DIR/logs"
mkdir -p "$DIR/static/icons"

# Create virtual environment
python3 -m venv "$DIR/venv"
source "$DIR/venv/bin/activate"

# Install requirements
pip install -r "$DIR/requirements.txt"

# Make scripts executable
chmod +x "$DIR/src/tracker/screen_time_tracker.py"
chmod +x "$DIR/src/server/serve_viewer.py"
chmod +x "$DIR/start_all.sh"
chmod +x "$DIR/start_screen_tracker.sh"

# Create desktop entry
cat > "$HOME/.config/autostart/chronos-screen-time-tracker.desktop" << EOL
[Desktop Entry]
Type=Application
Name=Chronos Screen Time Tracker
Exec=/bin/bash -c "cd $DIR && source venv/bin/activate && python3 src/tracker/screen_time_tracker.py"
Icon=$DIR/static/icons/icon-192x192.png
Terminal=false
Categories=Utility;
EOL

echo "Setup completed successfully!" 