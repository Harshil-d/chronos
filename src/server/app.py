"""
Server module for serving the web interface.
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from ..tracker.utils.config import Config

app = Flask(__name__)
CORS(app)

config = Config()

@app.route('/')
def index():
    """Serve the main HTML file."""
    return send_from_directory('src', 'index.html')

@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve static assets."""
    return send_from_directory('src/assets', path)

@app.route('/api/data/<date>')
def get_data(date: str):
    """
    Get screen time data for a specific date.

    Args:
        date: Date string in YYYY-MM-DD format

    Returns:
        Dict: Screen time data for the date
    """
    try:
        file_path = Path(config.data_dir) / f"screen_time_{date}.json"
        if file_path.exists():
            with open(file_path, 'r') as f:
                return jsonify(json.load(f))
        return jsonify({'events': [], 'total_time': 0})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/range/<start_date>/<int:days>')
def get_data_range(start_date: str, days: int):
    """
    Get screen time data for a range of dates.

    Args:
        start_date: Start date string in YYYY-MM-DD format
        days: Number of days to include

    Returns:
        Dict: Combined screen time data for the date range
    """
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        combined_data = {'events': [], 'total_time': 0}

        for i in range(days):
            current_date = start + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            file_path = Path(config.data_dir) / f"screen_time_{date_str}.json"
            
            if file_path.exists():
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    combined_data['events'].extend(data.get('events', []))
                    combined_data['total_time'] += data.get('total_time', 0)

        return jsonify(combined_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/current-session')
def get_current_session():
    """
    Get information about the current session.

    Returns:
        Dict: Current session information
    """
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        file_path = Path(config.data_dir) / f"screen_time_{today}.json"
        
        if file_path.exists():
            with open(file_path, 'r') as f:
                data = json.load(f)
                events = data.get('events', [])
                
                # Find the last STARTUP or UNLOCK event
                for event in reversed(events):
                    if event['type'] in ['STARTUP', 'UNLOCK']:
                        return jsonify({
                            'start_time': event['timestamp'],
                            'is_active': True
                        })
        
        return jsonify({'is_active': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def run_server():
    """Run the Flask server."""
    server_config = config.server
    app.run(
        host=server_config.get('host', 'localhost'),
        port=server_config.get('port', 5000)
    )

if __name__ == '__main__':
    run_server() 