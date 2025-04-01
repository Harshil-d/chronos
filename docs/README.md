# Screen Time Tracker

A modern web application for tracking and analyzing screen time data. This application provides real-time analytics, interactive timeline visualization, and detailed event tracking for monitoring computer usage.

## Screenshots

[![Dashboard View](/docs/screenshot/dashboard.png)](docs/screenshot/dashboard.png)
*Dashboard showing real-time analytics and usage patterns*

[![Timeline View](/docs/screenshot/timeline.png)](docs/screenshot/timeline.png)
*Interactive timeline visualization of screen time events*

[![Events View](/docs/screenshot/events.png)](docs/screenshot/events.png)
*Detailed list of system events and activities*

## Why Screen Time Tracker?

In today's digital age, understanding and managing our screen time is crucial for maintaining a healthy work-life balance. Screen Time Tracker helps you:

- **Monitor Your Digital Habits**: Track how much time you spend on your computer
- **Improve Productivity**: Identify patterns in your work and break times
- **Make Data-Driven Decisions**: Use analytics to optimize your daily schedule
- **Maintain Work-Life Balance**: Set healthy boundaries for screen time

## Key Features

- **Real-time Analytics**: View your screen time statistics as they happen
- **Interactive Timeline**: Visualize your computer usage patterns over time
- **Detailed Event Logging**: Track system events like startups, unlocks, and shutdowns
- **Daily & Weekly Reports**: Get comprehensive insights into your screen time habits
- **Offline Support**: Access your data even without an internet connection
- **Modern Interface**: Clean, responsive design that works on all devices

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Harshil-d/chronos.git
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

4. Start the screen time tracker:
```bash
screen-time-tracker
```

5. Start the web server:
```bash
screen-time-server
```

6. Open your web browser and navigate to:
```
http://localhost:5000
```

## Technical Documentation

This document provides detailed technical information about the Screen Time Tracker application.

## Project Architecture

The application is built with a modular architecture consisting of two main components:

1. **Screen Time Tracker**: A Python-based backend service that monitors system events
2. **Web Interface**: A modern, responsive frontend built with vanilla JavaScript

### Directory Structure

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

The core module that tracks system events and records screen time data. It consists of:

- **Event Handler**: Monitors system events using platform-specific APIs
- **Data Storage**: Manages JSON-based data storage with daily files
- **Session Management**: Tracks active sessions and calculates durations

### Event Handler

Handles system events such as:
- System startup/shutdown
- User login/logout
- Screen lock/unlock
- System idle/active states

### Web Server

A Flask-based server that:
- Serves the web interface
- Provides RESTful API endpoints
- Handles data access and aggregation

### Web Interface

A modern, responsive web application featuring:
- Real-time data updates
- Interactive timeline visualization
- Detailed event logging
- Offline support via service workers

## API Documentation

### Endpoints

#### GET /api/data/<date>
Returns screen time data for a specific date.

**Response Format:**
```json
{
    "events": [
        {
            "type": "STARTUP",
            "timestamp": "2024-02-20T08:00:00"
        }
    ],
    "total_time": 14400
}
```

#### GET /api/data/range/<start_date>/<days>
Returns combined data for a range of dates.

#### GET /api/current-session
Returns information about the current active session.

## Configuration

The application can be configured via `config.json`:

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

### Event Data
Events are stored in daily JSON files with the following structure:

```json
{
    "events": [
        {
            "type": "STARTUP",
            "timestamp": "2024-02-20T08:00:00"
        }
    ],
    "total_time": 14400
}
```

### Event Types
- `STARTUP`: System startup
- `SHUTDOWN`: System shutdown
- `LOGIN`: User login
- `LOGOUT`: User logout
- `LOCK`: Screen lock
- `UNLOCK`: Screen unlock
- `IDLE`: System idle
- `ACTIVE`: System active
- `ERROR`: Error event

## Development Guidelines

### Code Style
- Follow PEP 8 guidelines
- Use type hints
- Write docstrings for all functions and classes
- Keep functions focused and small

### Testing
- Write unit tests for all new features
- Maintain test coverage above 80%
- Use pytest for testing

### Git Workflow
1. Create feature branches from `develop`
2. Use conventional commits
3. Submit PRs for review
4. Merge to `develop` after approval

### Dependencies
- Python 3.8+
- Flask 3.0.2+
- Flask-CORS 4.0.0+
- Other dependencies listed in `requirements.txt`

## Performance Considerations

- Event processing is done asynchronously
- Data is stored in daily files for efficient access
- Web interface uses lazy loading for large datasets
- API responses are cached when appropriate

## Security

- No sensitive data is stored
- API endpoints are CORS-enabled
- Input validation on all endpoints
- Secure file handling practices

## Error Handling

- Comprehensive logging system
- Graceful degradation
- User-friendly error messages
- Automatic recovery from common issues

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

1. Code of Conduct
2. Development Process
3. Pull Request Process
4. Coding Standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Chart.js for the beautiful charts
- Flask for the web framework
- All contributors who have helped with this project