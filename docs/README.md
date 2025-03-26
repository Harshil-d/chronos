# Chronos

A modern, intelligent screen time tracker for Linux that helps you monitor and understand your computer usage patterns.

![Chronos Logo](static/icons/icon-192x192.png)

## About

Chronos is a lightweight yet powerful screen time tracking tool that runs seamlessly in the background on Linux systems. It provides detailed insights into your computer usage patterns through an elegant web interface and supports offline access through PWA capabilities.

## Project Structure

```
chronos/
├── src/                    # Source code
│   ├── tracker/           # Screen time tracking functionality
│   │   └── screen_time_tracker.py
│   └── server/           # HTTP server for the viewer
│       └── serve_viewer.py
├── static/                # Static assets
│   ├── css/              # Stylesheets
│   │   └── styles.css
│   ├── js/               # JavaScript files
│   │   └── viewer.js
│   └── icons/            # PWA icons
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── data/                  # Data storage
│   └── screen_time_data/ # JSON data files
├── logs/                  # Log files
├── docs/                  # Documentation
│   └── README.md
├── chronos.service       # Systemd service file
├── install_service.sh    # Service installation script
├── requirements.txt      # Python dependencies
├── setup.sh             # Setup script
├── start_all.sh         # Start script
├── manifest.json        # PWA manifest
└── screen_time_viewer.html # Main HTML viewer
```

## Features

- 🔒 Secure screen lock/unlock event tracking
- 🚀 System startup and shutdown monitoring
- 👤 User session tracking
- ⏱️ Real-time screen time calculation
- 📊 Interactive analytics dashboard
- 🌐 PWA support for offline access
- 📅 Date-based data filtering
- 📈 Detailed event timeline
- 🔄 Automatic background synchronization

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chronos.git
cd chronos
```

2. Run the setup script:
```bash
./setup.sh
```

This will:
- Create necessary directories
- Set up a Python virtual environment
- Install required packages
- Configure permissions

3. Install the systemd service:
```bash
./install_service.sh
```

This will:
- Install Chronos as a user systemd service
- Enable autostart on login
- Start the service immediately

## Usage

### Service Management

Control Chronos using systemd:
```bash
# Check service status
systemctl --user status chronos.service

# Start the service
systemctl --user start chronos.service

# Stop the service
systemctl --user stop chronos.service

# Restart the service
systemctl --user restart chronos.service

# View logs
journalctl --user -u chronos.service -f
```

### Viewing Your Screen Time

Open your browser and navigate to:
```
http://localhost:4567/
```

### Data Location

- Screen time data: `data/screen_time_data/screen_time_YYYY-MM-DD.json`
- Log files:
  - Tracker logs: `logs/screen_time_tracker.log`
  - Server logs: `logs/viewer_server.log`
  - Startup logs: `logs/startup.log`

### Checking Status

To check if Chronos is running:
```bash
systemctl --user status chronos.service
```

### Viewing Logs

To view all logs:
```bash
# View service logs
journalctl --user -u chronos.service -f

# View tracker logs
tail -f logs/screen_time_tracker.log

# View server logs
tail -f logs/viewer_server.log

# View startup logs
tail -f logs/startup.log
```

## Troubleshooting

1. If the service isn't starting:
   - Check the service status: `systemctl --user status chronos.service`
   - View the logs: `journalctl --user -u chronos.service -f`
   - Ensure proper permissions: `chmod +x start_all.sh src/tracker/screen_time_tracker.py src/server/serve_viewer.py`

2. If the viewer isn't accessible:
   - Check if the server is running: `systemctl --user status chronos.service`
   - Look at server logs: `tail -f logs/viewer_server.log`
   - Ensure port 4567 is not in use: `lsof -i :4567`

3. If data isn't updating:
   - Check file permissions in `data/screen_time_data/`
   - Verify the service is running: `systemctl --user status chronos.service`
   - Check for errors in the logs: `journalctl --user -u chronos.service -f`

## Data Structure

The screen time data is stored in JSON format with the following structure:

```json
{
    "events": [
        {
            "timestamp": "2024-XX-XX HH:MM:SS",
            "type": "startup|shutdown|lock|unlock|logout"
        }
    ],
    "total_time": 0,
    "current_session": {
        "start_time": "2024-XX-XX HH:MM:SS",
        "is_active": true|false
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT License](LICENSE)

## Acknowledgments

- Thanks to all contributors who have helped shape Chronos
- Built with Python, modern web technologies, and ❤️

---
Made with ⏱️ by Harshil Zadafiya