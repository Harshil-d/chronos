#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create necessary directories
mkdir -p "$DIR/data/screen_time_data"
mkdir -p "$DIR/logs"

# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Make scripts executable
chmod +x "$DIR/src/tracker/screen_time_tracker.py"
chmod +x "$DIR/src/server/serve_viewer.py"
chmod +x "$DIR/start_all.sh"

# Create autostart directory if it doesn't exist
mkdir -p ~/.config/autostart

# Create desktop entry for autostart
cat > ~/.config/autostart/chronos.desktop << EOL
[Desktop Entry]
Type=Application
Name=Chronos
Comment=Modern screen time tracking for Linux
Exec=bash -c "cd ${DIR} && ./start_all.sh"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Icon=${DIR}/static/icons/icon-512x512.png
EOL

echo "Chronos setup completed successfully!"
echo "The application will start automatically on next login."
echo "To start it now, run: ./start_all.sh" 