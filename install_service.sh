#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Make sure the scripts are executable
chmod +x "$DIR/start_all.sh"
chmod +x "$DIR/src/tracker/screen_time_tracker.py"
chmod +x "$DIR/src/server/serve_viewer.py"

# Create systemd user directory if it doesn't exist
mkdir -p ~/.config/systemd/user/

# Copy service file to systemd user directory
cp "$DIR/chronos.service" ~/.config/systemd/user/

# Reload systemd daemon
systemctl --user daemon-reload

# Enable and start the service
systemctl --user enable chronos.service
systemctl --user start chronos.service

echo "Chronos service installed and started successfully!"
echo "To check status: systemctl --user status chronos.service"
echo "To view logs: journalctl --user -u chronos.service -f" 