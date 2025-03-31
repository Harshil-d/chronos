# Screen Time Tracker

A modern web application for tracking and analyzing screen time data. This application provides real-time analytics, interactive timeline visualization, and detailed event tracking for monitoring computer usage.

## Features

- Real-time screen time tracking
- Interactive timeline visualization
- Detailed event logging
- Daily and weekly analytics
- Offline support
- Modern, responsive web interface

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/screen-time-tracker.git
cd screen-time-tracker
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the package:
```bash
pip install -e .
```

## Usage

1. Start the screen time tracker:
```bash
screen-time-tracker
```

2. Start the web server:
```bash
screen-time-server
```

3. Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
src/
├── tracker/
│   ├── core/
│   │   └── screen_time_tracker.py
│   ├── events/
│   │   ├── event_types.py
│   │   └── event_handler.py
│   └── utils/
│       ├── config.py
│       └── logger.py
├── server/
│   └── app.py
└── assets/
    ├── css/
    ├── js/
    └── images/
```

## Components

### Screen Time Tracker
The core module that tracks system events and records screen time data.

### Event Handler
Handles system events such as startup, shutdown, login, logout, and screen lock/unlock.

### Web Server
Serves the web interface and provides API endpoints for data access.

### Web Interface
A modern, responsive web application built with vanilla JavaScript and Chart.js.

## Configuration

The application can be configured by creating a `config.json` file in the project root:

```json
{
    "data_dir": "~/.screen_time",
    "log_dir": "~/.screen_time/logs",
    "idle_threshold": 300,
    "debug": false,
    "server": {
        "host": "localhost",
        "port": 5000
    }
}
```

## Data Format

Screen time data is stored in JSON files with the following format:

```json
{
    "events": [
        {
            "type": "STARTUP",
            "timestamp": "2024-02-20T08:00:00"
        },
        {
            "type": "LOCK",
            "timestamp": "2024-02-20T12:00:00"
        }
    ],
    "total_time": 14400
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chart.js for the beautiful charts
- Flask for the web framework
- All contributors who have helped with this project